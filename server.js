const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const CSV_FILE = path.join(__dirname, 'danh_sach_khach.csv');

// Write CSV header if file doesn't exist. \uFEFF is for Excel UTF-8 support
if (!fs.existsSync(CSV_FILE)) {
  fs.writeFileSync(CSV_FILE, '\uFEFF"Thời Gian","Họ Tên","Số Điện Thoại","Gói Quan Tâm / Nguồn"\n', 'utf8');
}

const server = http.createServer((req, res) => {
  // Add CORS headers so the browser can send requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/lead') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const name = data.name || '';
        const phone = data.phone || '';
        const source = data.source || '';
        const time = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

        // Escape CSV fields safely
        const escapeCSV = (str) => `"${str.replace(/"/g, '""')}"`;
        const csvLine = `${escapeCSV(time)},${escapeCSV(name)},${escapeCSV(phone)},${escapeCSV(source)}\n`;

        fs.appendFileSync(CSV_FILE, csvLine, 'utf8');
        
        console.log(`[+] Đã lưu khách hàng mới: ${name} - ${phone} (${source})`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Lưu thành công!' }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Dữ liệu không hợp lệ!' }));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`[LUMINA LOCAL SERVER] Đang chạy tại http://localhost:${PORT}`);
  console.log(`[FILE LƯU TRỮ] Thông tin khách được lưu vào: ${CSV_FILE}`);
  console.log(`[HƯỚNG DẪN] Giữ nguyên cửa sổ đen này để hệ thống có thể thu thập thông tin.`);
  console.log(`=========================================`);
});
