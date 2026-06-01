import { NextResponse } from 'next/server';
import os from 'os';
import fs from 'fs';
import path from 'path';

// Đảm bảo thư mục logs tồn tại trên server
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFilePath = path.join(logDir, 'access-perf.log');

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { url, method, duration, ip, status } = data;

    // Loại bỏ query parameters (phần sau dấu ?) khỏi URL để log sạch sẽ, gọn gàng
    const cleanUrl = url ? url.split('?')[0] : '';

    // Đo lường bộ nhớ RAM và CPU thực tế
    const heapUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const freeMemGB = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const totalMemGB = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const cpuLoad = os.loadavg()[0].toFixed(2); // Tải CPU trung bình trong 1 phút qua
    const timestamp = new Date().toLocaleString('vi-VN');

    // Tạo dòng log chuyên nghiệp, trực quan
    const logMessage = `[${timestamp}] [PERF] ${method.padEnd(5)} | ${cleanUrl.padEnd(40)} | Status: ${status} | Duration: ${duration.toFixed(1).padStart(5)}ms | Node Heap: ${heapUsedMB.padStart(6)}MB | Free RAM: ${freeMemGB}GB/${totalMemGB}GB | CPU Load: ${cpuLoad} | IP: ${ip}\n`;

    // 1. In ra console (dành cho lệnh: docker logs)
    console.log(logMessage.trim());

    // 2. Ghi thêm vào tệp log cục bộ (bọc try-catch để an toàn tuyệt đối)
    try {
      fs.appendFileSync(logFilePath, logMessage, 'utf-8');
    } catch (fsError) {
      console.error("[PERF LOGGER ERROR] Không thể ghi file log:", fsError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
