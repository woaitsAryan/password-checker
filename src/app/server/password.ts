'use server'

import prisma from "@/lib/prisma"
import { decryptData, encryptData, upsertEncryptionKey } from "./encryption"
import crypto from "node:crypto"
import { cookies } from "next/headers"
import { type DecryptedPassword, verifyToken } from "./helpers"

type StoredPassword = {
  service: string
  username: string
  encryptedData: string
  iv: string
}

export async function verifyAuth(): Promise<string | null> {
  const token = (await cookies()).get('auth-token')
  if (!token) { 
    return null
  }

  const decoded = verifyToken(token.value)
  if (!decoded || !decoded.userId) {
    return null
  }

  return decoded.userId
}

/**
 * Stores an encrypted password for a user
 * @param userId The ID of the user who owns this password
 * @param password The password data to store
 */
export async function storePassword(password: {
  service: string,
  username: string,
  password: string  // Changed to accept plain password
}) {
  const authenticatedUserId = await verifyAuth()
  if (!authenticatedUserId) {
    throw new Error("Unauthorized")
  }

  // Get the active encryption key for the user
  const activeKey = await upsertEncryptionKey(authenticatedUserId)
  if (!activeKey) {
    throw new Error("No active encryption key found for user")
  }

  // Encrypt the password
  const { encryptedData, iv } = await encryptData(password.password, activeKey.key);

  return prisma.password.create({
    data: {
      userId: authenticatedUserId,
      service: password.service,
      username: password.username,
      encryptedData: encryptedData,
      iv: iv,
      keyId: activeKey.id
    }
  })
}

/**
 * Retrieves all passwords for a user
 * @param userId The ID of the user whose passwords we want to retrieve
 */
export async function getPasswords() {
  const authenticatedUserId = await verifyAuth()
  if (!authenticatedUserId) {
    throw new Error("Unauthorized")
  }

  return prisma.password.findMany({
    where: {
      userId: authenticatedUserId
    },
    include: {
      key: true // Include the encryption key used for each password
    }
  })
}

/**
 * Retrieves passwords for a specific service
 * @param userId The ID of the user
 * @param service The service name to filter by
 */
export async function getPasswordsByService(userId: string, service: string) {
  return prisma.password.findMany({
    where: {
      userId: userId,
      service: service
    },
    include: {
      key: true
    }
  })
}

/**
 * Updates an existing password
 * @param passwordId The ID of the password to update
 * @param userId The ID of the user (for verification)
 * @param updates The new password data
 */
export async function updatePassword(
  passwordId: string,
  userId: string,
  updates: Partial<StoredPassword>
) {
  const authenticatedUserId = await verifyAuth()
  if (!authenticatedUserId) {
    throw new Error("Unauthorized")
  }

  const activeKey = await upsertEncryptionKey(authenticatedUserId)
  if (!activeKey) {
    throw new Error("No active encryption key found for user")
  }

  return prisma.password.update({
    where: {
      id: passwordId,
      userId: userId // Ensure the password belongs to the user
    },
    data: {
      ...updates,
      keyId: activeKey.id,
      updatedAt: new Date()
    }
  })
}

/**
 * Deletes a password
 * @param passwordId The ID of the password to delete
 * @param userId The ID of the user (for verification)
 */
export async function deletePassword(passwordId: string) {
  const authenticatedUserId = await verifyAuth()
  if (!authenticatedUserId) {
    throw new Error("Unauthorized")
  }

  return prisma.password.delete({
    where: {
      id: passwordId,
      userId: authenticatedUserId // Ensure the password belongs to the user
    }
  })
}

/**
 * Retrieves all passwords for a user and decrypts them
 */
export async function getDecryptedPasswords(): Promise<DecryptedPassword[]> {
  const authenticatedUserId = await verifyAuth()
  if (!authenticatedUserId) {
    throw new Error("Unauthorized")
  }

  const encryptedPasswords = await prisma.password.findMany({
    where: {
      userId: authenticatedUserId
    },
    include: {
      key: true
    }
  });

  // Decrypt each password
  const decryptedPasswords = await Promise.all(
    encryptedPasswords.map(async (encPass) => {
      const decryptedPassword = await decryptData(
        encPass.encryptedData,
        encPass.iv,
        encPass.key.key
      );

      return {
        id: encPass.id,
        service: encPass.service,
        username: encPass.username,
        password: decryptedPassword,
        createdAt: encPass.createdAt,
        updatedAt: encPass.updatedAt
      };
    })
  );

  return decryptedPasswords;
}