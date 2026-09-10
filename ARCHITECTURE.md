# ARCHITECTURE.md - IELTS Practice Test Platform

## 1. Tổng quan hệ thống
Hệ thống thi thử và luyện tập IELTS Reading & Listening đa năng, hỗ trợ Audio Synchronized Transcripts, chấm điểm tức thì, đồng bộ điểm số lên Google Sheets / Drive và tích hợp Trợ giảng ảo AI (Gemini).

## 2. Kiến trúc thư mục (Modular Structure)
```text
├── ARCHITECTURE.md          # Sơ đồ & Tài liệu kiến trúc chuẩn
├── index.html               # Cổng đăng nhập và lịch sử bài làm
├── css/                     # Tầng giao diện chuẩn hóa
│   ├── base.css             # Theme (Dark/Light), CSS vars, Reset
│   ├── components.css       # Controls, Timer, Header, Auth Box, Modal
│   ├── reading.css          # Giao diện thi đọc 2 cột
│   └── listening.css        # Audio sync, bảng đáp án, navigation đáy
├── js/                      # Tầng Logic Module hóa (ES Modules)
│   ├── config.js            # API Endpoints & cấu hình tập trung
│   ├── state.js             # Quản lý LocalStorage và State học viên
│   ├── timer.js             # Bộ đếm giờ
│   ├── highlight.js         # Tool bôi đen văn bản để Highlight/Xóa
│   ├── audio-sync.js        # Đồng bộ Audio với từng mili-giây transcript
│   ├── resizer.js           # Kéo thả thay đổi độ rộng 2 cột
│   ├── ai-assistant.js      # Giao tiếp API Trợ giảng Gemini
│   ├── evaluator.js         # Engine chấm điểm & nộp bài Cloud
│   └── app.js               # Điểm khởi chạy (Entry point)
└── tests/                   # Các bài test (HTML độc lập)
```

## 3. Luồng dữ liệu (Data Flow)
1. **Khởi động:** `app.js` khởi tạo `TestTimer`, đọc thông tin học sinh từ `state.js`, kích hoạt `resizer.js` và `highlight.js`.
2. **Làm bài:** Mọi thao tác gõ chữ / chọn Radio được tự động lưu trạng thái định kỳ vào LocalStorage qua `state.js`.
3. **Nghe (Listening):** `audio-sync.js` bắt sự kiện `timeupdate` của `<audio>`, tìm kiếm mốc thời gian trong transcript để đổi class `.playing-active` và cuộn trang mượt.
4. **Nộp bài:** `evaluator.js` đọc `window.TEST_DATA.answers`, so khớp với dữ liệu học viên đã nhập, hiển thị đúng/sai trực quan và đẩy payload về Google Sheets & Drive qua `fetch`.
5. **Hỏi đáp AI:** Khi người dùng nhập câu hỏi vào ô AI, `ai-assistant.js` trích xuất nội dung câu hỏi hiện tại, gói prompt và gửi đến Cloud Functions / Google Apps Script.

## 4. Chuẩn khai báo Đề thi mới (Data Contract)
Mỗi file đề thi chỉ cần khai báo một Object JSON duy nhất ở cuối trang:
```javascript
window.TEST_DATA = {
  title: "Tên bài test",
  answers: {
    q1: "từ khóa đáp án",
    q2: ["đáp án 1", "đáp án thay thế"],
    q3: "TRUE" // hoặc "A", "B", "C"
  }
};
```
Và nhúng module script:
```html
<script type="module" src="js/app.js"></script>
```
