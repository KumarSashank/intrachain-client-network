import { create } from 'kubo-rpc-client';
import fs from 'fs';
import { TextDecoder } from 'util';

const client = create();

async function addFile(content) {
    const startTime = performance.now();
    const { cid } = await client.add(content);
    const endTime = performance.now();
    const uploadTime = endTime - startTime;
    return { cid, uploadTime };
}

async function getFile(cid) {
    const startTime = performance.now();
    let data = [];
    for await (const chunk of client.cat(cid)) {
        data.push(chunk);
    }
    const fileContent = Buffer.concat(data);
    const endTime = performance.now();
    const retrieveTime = endTime - startTime;
    return { fileContent, retrieveTime };
}

async function handleMultipleFiles() {
    const numberOfFiles = 2000;
    const files = [];
    const csvHeader = 'File Number,CID,Upload Time,Retrieve Time\n';
    let csvContent = csvHeader;

    for (let i = 1; i <= numberOfFiles; i++) {
        const content = `Hello world from file ${i}!`;
        const { cid, uploadTime } = await addFile(content);
        files.push({ cid, uploadTime, fileNumber: i });
    }

    for (const file of files) {
        const { cid, uploadTime, fileNumber } = file;
        const { fileContent, retrieveTime } = await getFile(cid);
        console.log(`Retrieved file content: ${new TextDecoder().decode(fileContent)}`);
        csvContent += `${fileNumber},${cid},${uploadTime},${retrieveTime}\n`;
    }

    fs.writeFileSync('response_times.csv', csvContent);
}

handleMultipleFiles().catch(console.error);
