import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { CompanySettings, ProposalItem } from '@/types';

export interface BusinessDocData {
  docLabel: string;
  number: string;
  date: string;
  validLabel?: string;
  validValue?: string;
  company: CompanySettings;
  partyName: string;
  partyAddress: string;
  partyGstin?: string;
  subject?: string;
  items: ProposalItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  transportCharge: number;
  total: number;
  terms?: string;
}

const inr = (n: number) =>
  'Rs. ' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: '#0F172A' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#0F3D5C',
    paddingBottom: 10,
  },
  companyName: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#0F3D5C' },
  small: { fontSize: 8, color: '#475569', marginTop: 2 },
  docTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#E87722' },
  section: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between' },
  block: { width: '48%' },
  label: { fontSize: 7, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 },
  bold: { fontFamily: 'Helvetica-Bold' },
  table: { marginTop: 16 },
  tableHead: {
    flexDirection: 'row',
    backgroundColor: '#0F3D5C',
    color: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9EF',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  cDesc: { width: '40%' },
  cNum: { width: '15%', textAlign: 'right' },
  cAmt: { width: '15%', textAlign: 'right' },
  totals: { marginTop: 10, alignSelf: 'flex-end', width: '45%' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#0F3D5C',
    marginTop: 4,
    paddingTop: 4,
  },
  footer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E9EF',
    paddingTop: 8,
    fontSize: 7,
    color: '#94A3B8',
  },
});

export function BusinessDocPdf({ data }: { data: BusinessDocData }) {
  const intra = data.cgst > 0;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>{data.company.legalName || data.company.name}</Text>
            <Text style={styles.small}>
              {data.company.address.line1}, {data.company.address.city},{' '}
              {data.company.address.state} {data.company.address.pincode}
            </Text>
            <Text style={styles.small}>
              GSTIN: {data.company.gstin} | PAN: {data.company.pan}
            </Text>
            <Text style={styles.small}>
              {data.company.email} | {data.company.phone}
            </Text>
          </View>
          <View>
            <Text style={styles.docTitle}>{data.docLabel}</Text>
            <Text style={[styles.small, { marginTop: 6 }]}>No: {data.number}</Text>
            <Text style={styles.small}>Date: {data.date}</Text>
            {data.validLabel && (
              <Text style={styles.small}>
                {data.validLabel}: {data.validValue}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.block}>
            <Text style={styles.label}>Billed To</Text>
            <Text style={styles.bold}>{data.partyName}</Text>
            <Text style={styles.small}>{data.partyAddress}</Text>
            {data.partyGstin && (
              <Text style={styles.small}>GSTIN: {data.partyGstin}</Text>
            )}
          </View>
          {data.subject && (
            <View style={styles.block}>
              <Text style={styles.label}>Subject</Text>
              <Text>{data.subject}</Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHead}>
            <Text style={styles.cDesc}>Description</Text>
            <Text style={styles.cNum}>Qty</Text>
            <Text style={styles.cNum}>Rate</Text>
            <Text style={styles.cNum}>GST%</Text>
            <Text style={styles.cAmt}>Amount</Text>
          </View>
          {data.items.map((li) => (
            <View key={li.id} style={styles.tableRow}>
              <Text style={styles.cDesc}>{li.description}</Text>
              <Text style={styles.cNum}>
                {li.quantity} {li.unit}
              </Text>
              <Text style={styles.cNum}>{inr(li.rate)}</Text>
              <Text style={styles.cNum}>{li.gstPercent}%</Text>
              <Text style={styles.cAmt}>{inr(li.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{inr(data.subtotal)}</Text>
          </View>
          {data.transportCharge > 0 && (
            <View style={styles.totalRow}>
              <Text>Transportation</Text>
              <Text>{inr(data.transportCharge)}</Text>
            </View>
          )}
          {intra ? (
            <>
              <View style={styles.totalRow}>
                <Text>CGST (9%)</Text>
                <Text>{inr(data.cgst)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>SGST (9%)</Text>
                <Text>{inr(data.sgst)}</Text>
              </View>
            </>
          ) : (
            <View style={styles.totalRow}>
              <Text>IGST (18%)</Text>
              <Text>{inr(data.igst)}</Text>
            </View>
          )}
          <View style={styles.grandRow}>
            <Text style={styles.bold}>Grand Total</Text>
            <Text style={styles.bold}>{inr(data.total)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.block}>
            <Text style={styles.label}>Bank Details</Text>
            <Text style={styles.small}>Bank: {data.company.bankName}</Text>
            <Text style={styles.small}>A/c: {data.company.bankAccount}</Text>
            <Text style={styles.small}>IFSC: {data.company.bankIfsc}</Text>
          </View>
          {data.terms && (
            <View style={styles.block}>
              <Text style={styles.label}>Terms & Conditions</Text>
              <Text style={styles.small}>{data.terms}</Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          This is a computer-generated document from OilGas CRM. Generated for
          demonstration purposes — all data is mocked.
        </Text>
      </Page>
    </Document>
  );
}
