// Helper module for Azure Blob Storage
import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob"

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || ""
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "comics"
const cdnEndpoint = process.env.AZURE_CDN_ENDPOINT || ""

/**
 * Uploads a file to Azure Blob Storage
 */
export async function uploadToBlob(data: ArrayBuffer | Buffer, blobName: string): Promise<void> {
  if (!connectionString) {
    throw new Error("Azure Storage connection string is not configured")
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  const containerClient = blobServiceClient.getContainerClient(containerName)

  // Create the container if it doesn't exist
  await ensureContainer(containerClient)

  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  await blockBlobClient.uploadData(data, {
    blobHTTPHeaders: {
      blobContentType: blobName.endsWith(".png")
        ? "image/png"
        : blobName.endsWith(".mp3")
          ? "audio/mpeg"
          : "application/octet-stream",
    },
  })
}

/**
 * Ensures the container exists
 */
async function ensureContainer(containerClient: ContainerClient): Promise<void> {
  const exists = await containerClient.exists()
  if (!exists) {
    await containerClient.create({
      access: "blob", // Public read access for blobs only
    })
  }
}

/**
 * Gets the URL for an image in Azure Blob Storage
 */
export function getImageUrl(blobName: string): string {
  if (cdnEndpoint) {
    return `${cdnEndpoint}/${blobName}`
  }

  // Fallback to direct blob URL if CDN is not configured
  return `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${containerName}/${blobName}`
}

/**
 * Gets the URL for an audio file in Azure Blob Storage
 */
export function getAudioUrl(blobName: string): string {
  if (cdnEndpoint) {
    return `${cdnEndpoint}/${blobName}`
  }

  // Fallback to direct blob URL if CDN is not configured
  return `https://${process.env.AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${containerName}/${blobName}`
}
