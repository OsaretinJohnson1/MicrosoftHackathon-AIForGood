import { BlobServiceClient, BlockBlobClient, ContainerClient } from "@azure/storage-blob";

// Azure Blob Storage configuration
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
const containerName = process.env.AZURE_STORAGE_CONTAINER || "comics-content";

// Create the BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Get a reference to the container
let containerClientInstance: ContainerClient | null = null;

/**
 * Get or create the container client
 */
async function getContainerClient(): Promise<ContainerClient> {
  if (containerClientInstance) {
    return containerClientInstance;
  }
  
  containerClientInstance = blobServiceClient.getContainerClient(containerName);
  
  // Create the container if it doesn't exist
  const containerExists = await containerClientInstance.exists();
  if (!containerExists) {
    await containerClientInstance.create({
      access: "blob" // Set public access level to blob (public read access for blobs only)
    });
  }
  
  return containerClientInstance;
}

/**
 * Upload image data to Azure Blob Storage
 * @param imageData Image data as ArrayBuffer
 * @param fileName Name for the file in Blob Storage
 * @returns URL of the uploaded image
 */
export async function uploadImage(
  imageData: ArrayBuffer,
  fileName: string
): Promise<string> {
  try {
    const containerClient = await getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    // Upload image data
    await blockBlobClient.uploadData(imageData, {
      blobHTTPHeaders: {
        blobContentType: "image/png"
      }
    });
    
    // Return the URL
    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Upload audio data to Azure Blob Storage
 * @param audioData Audio data as ArrayBuffer
 * @param fileName Name for the file in Blob Storage
 * @returns URL of the uploaded audio
 */
export async function uploadAudio(
  audioData: ArrayBuffer,
  fileName: string
): Promise<string> {
  try {
    const containerClient = await getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    
    // Determine content type based on file extension
    let contentType = "audio/mpeg"; // Default to MP3
    if (fileName.endsWith(".wav")) {
      contentType = "audio/wav";
    } else if (fileName.endsWith(".ogg")) {
      contentType = "audio/ogg";
    }
    
    // Upload audio data
    await blockBlobClient.uploadData(audioData, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });
    
    // Return the URL
    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading audio:", error);
    throw new Error(`Failed to upload audio: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Download a blob from Azure Blob Storage
 * @param blobName The name of the blob to download
 * @returns The blob data as an ArrayBuffer
 */
export async function downloadBlob(blobName: string): Promise<ArrayBuffer> {
  try {
    const containerClient = await getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Check if blob exists
    const exists = await blockBlobClient.exists();
    if (!exists) {
      throw new Error(`Blob "${blobName}" does not exist`);
    }
    
    // Download the blob
    const downloadResponse = await blockBlobClient.download(0);
    
    // Read the stream as ArrayBuffer
    return await streamToArrayBuffer(downloadResponse.readableStreamBody as unknown as ReadableStream<Uint8Array>);
  } catch (error) {
    console.error("Error downloading blob:", error);
    throw new Error(`Failed to download blob: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Delete a blob from Azure Blob Storage
 * @param blobName The name of the blob to delete
 */
export async function deleteBlob(blobName: string): Promise<void> {
  try {
    const containerClient = await getContainerClient();
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Delete the blob
    await blockBlobClient.delete();
  } catch (error) {
    console.error("Error deleting blob:", error);
    throw new Error(`Failed to delete blob: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Helper function to convert a ReadableStream to an ArrayBuffer
 */
async function streamToArrayBuffer(stream: ReadableStream<Uint8Array>): Promise<ArrayBuffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  // Concatenate chunks into a single Uint8Array
  let totalLength = 0;
  for (const chunk of chunks) {
    totalLength += chunk.length;
  }
  
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  
  return result.buffer;
}
