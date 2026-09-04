/**
 * Example: Prisma + Accelerate singleton.
 *
 * Requires `@prisma/client` and `@prisma/extension-accelerate` installed in
 * your project (they are not dependencies of this library):
 *
 *   npm install -D prisma
 *   npm install @prisma/client @prisma/extension-accelerate
 *   npx prisma init
 */
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const createExtendedPrismaClient = () =>
	new PrismaClient({
		datasources: { db: { url: process.env.DATABASE_URL } },
	}).$extends(withAccelerate());

export type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>;

declare global {
	var __prismaClientInstance: ExtendedPrismaClient | undefined;
}

export class PrismaService {
	private static instance: PrismaService;
	public readonly client: ExtendedPrismaClient;

	private constructor() {
		if (process.env.NODE_ENV === "production") {
			this.client = createExtendedPrismaClient();
		} else if (!globalThis.__prismaClientInstance) {
			globalThis.__prismaClientInstance = createExtendedPrismaClient();
			this.client = globalThis.__prismaClientInstance;
		} else {
			this.client = globalThis.__prismaClientInstance;
		}
	}

	public static getInstance(): PrismaService {
		if (!PrismaService.instance) {
			PrismaService.instance = new PrismaService();
		}
		return PrismaService.instance;
	}

	public CONNECT = async (): Promise<void> => {
		await this.client.$connect();
	};

	public DISCONNECT = async (): Promise<void> => {
		await this.client.$disconnect();
	};
}

export const PRISMA_SERVICE = PrismaService.getInstance();
export const db = PRISMA_SERVICE.client;
