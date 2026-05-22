import { pdf } from '@react-pdf/renderer';
import { BusinessDocPdf, type BusinessDocData } from './BusinessDocPdf';

/** Render a business document to a PDF Blob. Imported dynamically so that
 *  @react-pdf/renderer stays out of the initial bundle. */
export async function renderBusinessDoc(
  data: BusinessDocData,
): Promise<Blob> {
  return pdf(<BusinessDocPdf data={data} />).toBlob();
}
