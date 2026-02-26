"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const newDevice = await prisma.device.create({
        data: {
            name: 'ZKTeco Office Main',
            ip: '192.168.1.201',
            port: 4370,
            status: 'OFFLINE'
        }
    });
    console.log('Successfully added device:', newDevice);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=add_device.js.map