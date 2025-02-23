'use server'

import prisma from "@/lib/prisma"
import { verifyAuth } from "./password"
import crypto from "node:crypto"

// /**
//  * Creates and stores a new encryption key for storing passwords
//  * @returns The newly created encryption key record
//  */
// export async function createEncryptionKey() {
//   const authenticatedUserId = await verifyAuth()
//   if (!authenticatedUserId) {
//     throw new Error("Unauthorized")
//   }

//   // Generate a new random encryption key
//   const keyBuffer = await crypto.subtle.generateKey(
//     { name: "AES-GCM", length: 256 },
//     true,
//     ["encrypt", "decrypt"]
//   )
//   const exportedKey = await crypto.subtle.exportKey("raw", keyBuffer)
//   const key = Buffer.from(exportedKey).toString('base64')

//   // Deactivate all existing keys for this user
//   await prisma.encryptionKey.updateMany({
//     where: {
//       passwords: {
//         some: {
//           userId: authenticatedUserId
//         }
//       },
//       active: true
//     },
//     data: {
//       active: false
//     }
//   })

//   // Create new active key
//   return prisma.encryptionKey.create({
//     data: {
//       key: key,
//       active: true
//     }
//   })
// }

/**
 * Decrypts data using AES-GCM
 */
export async function decryptData(encryptedData: string, iv: string, keyString: string): Promise<string> {
  try {
    // Add logging to check input values
    // Convert base64 strings back to buffers
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');
    const keyBuffer = Buffer.from(keyString, 'base64');

    // Verify IV length (should be 12 bytes for AES-GCM)
    if (ivBuffer.length !== 12) {
      throw new Error(`Invalid IV length: ${ivBuffer.length}. Expected 12 bytes.`);
    }

    // Verify key length (should be 32 bytes for AES-256-GCM)
    if (keyBuffer.length !== 32) {
      throw new Error(`Invalid key length: ${keyBuffer.length}. Expected 32 bytes.`);
    }

    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      true,
      ['decrypt']
    );

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer
      },
      key,
      encryptedBuffer
    );

    // Convert the decrypted buffer to string
    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    console.error('Failed to decrypt data for service');
    throw error;
  }
}

export async function upsertEncryptionKey(userId: string) {
  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Find existing active key
  const existingKey = await prisma.encryptionKey.findFirst({
    where: {
      active: true,
      userId: userId
    }
  })

  if (existingKey) {
    return existingKey
  }

  // Generate a new random encryption key
  const keyBuffer = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  )
  const exportedKey = await crypto.subtle.exportKey("raw", keyBuffer)
  const key = Buffer.from(exportedKey).toString('base64')

  // Create new active key
  return prisma.encryptionKey.create({
    data: {
      key: key,
      active: true,
      user: {
        connect: {
          id: userId
        }
      }
    }
  })
}

/**
 * Encrypts data using AES-GCM
 */
export async function encryptData(data: string, keyString: string): Promise<{ encryptedData: string, iv: string }> {
  try {
    // Generate a 12-byte IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const keyBuffer = Buffer.from(keyString, 'base64');

    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt']
    );

    // Encrypt the data
    const encodedData = new TextEncoder().encode(data);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedData
    );

    // Convert to base64 strings
    return {
      encryptedData: Buffer.from(encryptedBuffer).toString('base64'),
      iv: Buffer.from(iv).toString('base64')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}