const ZKLib = require('node-zklib');

async function testZk() {
    console.log("Testing connection to ZKTeco device at 192.168.1.201:4370...");
    const zkInstance = new ZKLib('192.168.1.201', 4370, 5200, 4000);
    try {
        await zkInstance.createSocket();
        console.log("Connected to ZKTeco successfully!");

        const users = await zkInstance.getUsers();
        console.log(`Found ${users?.data?.length || 0} users`);

        await zkInstance.disconnect();
    } catch (err) {
        console.error("Failed to connect:", err);
    }
}

testZk();
