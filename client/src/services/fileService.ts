
import axios from 'axios';

/**
 * Upload artwork image for an order
 * @param orderId The order ID
 * @param imageData Base64 encoded image data
 * @returns API response
 */
export async function uploadArtworkImage(orderId: number, imageData: string) {
  try {
    const response = await axios.post(
      `/api/files/orders/${orderId}/artwork`,
      { imageData }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading artwork image:', error);
    throw error;
  }
}

/**
 * Get artwork image URL for an order
 * @param orderId The order ID
 * @returns URL to the artwork image
 */
export function getArtworkImageUrl(orderId: number) {
  return `/api/files/orders/${orderId}/artwork`;
}

/**
 * Get all files associated with an order
 * @param orderId The order ID
 * @returns List of files
 */
export async function getOrderFiles(orderId: number) {
  try {
    const response = await axios.get(`/api/files/orders/${orderId}/files`);
    return response.data;
  } catch (error) {
    console.error('Error getting order files:', error);
    throw error;
  }
}

/**
 * Upload any file for an order
 * @param orderId The order ID
 * @param fileData File data (base64)
 * @param fileName Name to save the file as
 * @param fileType MIME type of the file
 * @returns API response
 */
export async function uploadOrderFile(
  orderId: number,
  fileData: string,
  fileName: string,
  fileType: string
) {
  try {
    const response = await axios.post(
      `/api/files/orders/${orderId}/files`,
      { fileData, fileName, fileType }
    );
    return response.data;
  } catch (error) {
    console.error('Error uploading order file:', error);
    throw error;
  }
}

/**
 * Save frame preview for an order
 * @param orderId The order ID
 * @param previewData Preview image data (base64)
 * @returns API response
 */
export async function saveFramePreview(orderId: number, previewData: string) {
  try {
    const response = await axios.post(
      `/api/files/orders/${orderId}/preview`,
      { previewData }
    );
    return response.data;
  } catch (error) {
    console.error('Error saving frame preview:', error);
    throw error;
  }
}

/**
 * Get the URL for an order's frame preview
 * @param orderId The order ID
 * @returns URL to the frame preview
 */
export function getFramePreviewUrl(orderId: number) {
  return `/api/files/orders/${orderId}/files/frame-preview.jpg`;
}
