import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
	let user = await prisma.user.findFirst({ orderBy: { id: "asc" } });
	if (!user) {
		user = await prisma.user.create({
			data: {
				authProviderId: "seed-dummy-user",
				email: "dummy@example.com",
				firstName: "ダミー",
				lastName: "ユーザー",
				role: "ADMIN",
				isActive: true,
				isEmailVerified: true,
			},
		});
		console.log(`Created dummy user "${user.email}" (id: ${user.id})`);
	}

	console.log("Seed completed.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
