# 🎙️ Đồng Đồng TTS Studio

> **Studio chuyển văn bản thành giọng nói AI đa nền tảng không giới hạn ký tự — Tích hợp tính năng Phân Tích Ngược Giọng từ File Audio (Reverse Voice Clone), chức năng Lưu Giọng Tùy Chỉnh đặt tên riêng, giao diện chọn giọng siêu gọn gàng, cùng trọn bộ giọng đọc Bing, Google Cloud, Chị Google, TikTok và bộ tinh chỉnh Tông giọng / Độ cao giọng chuyên nghiệp.**

![Đồng Đồng TTS Studio](https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Tính Năng Nổi Bật (Key Features)

### 1. 🔍 Phân Tích Ngược & Trích Xuất Giọng Từ Audio (Reverse Voice Cloning)
- **Nhận diện file âm thanh đa định dạng**: Kéo thả hoặc tải lên bất kỳ file âm thanh nào (`.mp3`, `.wav`, `.m4a`, `.aac`, `.ogg`, `.webm` — ví dụ: trích xuất âm thanh từ video TikTok bạn thích).
- **Hỗ trợ Ghi âm trực tiếp bằng Micro**: Thu âm giọng nói 3-5 giây để AI phân tích tông giọng thực tế của bạn.
- **Thuật toán quét phổ âm học nâng cao (DSP Engine)**:
  - **Tần số cơ bản F0 (Fundamental Pitch)**: Đo đạc cao độ chính xác bằng thuật toán tự tương quan *Autocorrelation*, tự động quy đổi sang bán cung Semitones (`-12st` đến `+12st`).
  - **Nhịp điệu nói (Speaking Cadence / Tempo)**: Phân tích đường bao năng lượng RMS để tính tốc độ nói tự nhiên (`0.8x` đến `1.6x`).
  - **Độ sáng Formant & Vòm họng**: Đo tỷ lệ tần số cao/thấp để xác định tính chất giọng (em bé vòm họng cao, nữ thanh mảnh, nam trầm).
  - **Độ tương đồng & Đề xuất giọng**: Tự động tìm kiếm trong kho giọng đọc mẫu để chọn ra chất giọng nền khớp nhất (Confidence 90-99%).
- **Hành động 1 chạm**:
  - **"Áp Dụng Thử"**: Đưa toàn bộ cấu hình tông giọng, tốc độ vào studio ngay lập tức.
  - **"Lưu & Sử Dụng Ngay"**: Đặt tên và lưu lại thành loại giọng riêng của bạn trong tab *"⭐ Giọng đã lưu"*.

---

### 2. 🎛️ Giao Diện Chọn Giọng Đọc Thu Gọn (Compact Voice Selector)
- **Tối ưu không gian hiển thị**: Thu gọn hơn 50% chiều cao so với trước đây, không còn chiếm quá nhiều diện tích màn hình.
- **Thanh danh mục cuộn mượt**:
  - **🌟 Tất cả**: Xem nhanh toàn bộ giọng đọc.
  - **⭐ Giọng đã lưu**: Quản lý và kích hoạt các loại giọng do bạn tự tạo và lưu lại.
  - **🎵 TikTok & Bé**: Giọng em bé hot trend, bé gái cute, sóc chuột, nữ review.
  - **🎙️ Bing**: Toàn bộ dàn giọng Microsoft Bing (Hoài My, Nam Minh, Andrew, Ava, Brian...).
  - **☁️ Google Cloud**: Giọng chuẩn Wavenet & Neural2 (Nữ 1-3, Nam 1-3).
  - **📢 Chị Google**: Giọng đọc quốc dân huyền thoại.
  - **🌐 Trình duyệt**: Giọng Web Speech API nội bộ thiết bị.
- **Thanh trạng thái giọng đang chọn**: Hiển thị gọn gàng icon, tên, nhà cung cấp kèm nút gọi nhanh *"Phân tích Audio"* và *"Lưu giọng"*.
- **Tùy biến AI Prompting gấp gọn**: Dễ dàng mở ra khi cần nhập prompt chỉ đạo biểu cảm cho Gemini AI.

---

### 3. 🌓 Chế Độ Sáng / Tối (Light & Dark Theme Switcher)
- **Tùy biến phong cách hiển thị**: Nút chuyển đổi nhanh **Giao diện Sáng (Light Mode)** và **Giao diện Tối (Dark Mode)** ngay trên thanh điều hướng.
- **Tự động lưu trạng thái**: Lưu lại lựa chọn chế độ sáng/tối vào bộ nhớ trình duyệt, tự động áp dụng trong các lần sử dụng tiếp theo.
- **Biểu tượng ứng dụng đặc trưng**: Cập nhật biểu tượng ứng dụng Đồng Đồng cô bé đeo tai nghe cute làm Avatar và Favicon trang web.

---

### 4. 💾 Chức Năng Lưu Giọng Tùy Chỉnh (Custom Saved Voices)
- **Đặt tên tùy ý**: Đặt tên bất kỳ theo mục đích sử dụng (Ví dụ: *"Giọng Review Phim Kịch Tính"*, *"Bé Bống 3 Tuổi Hài Hước"*, *"Nữ Đọc Truyện Đêm Khuya"*...).
- **Lưu trọn vẹn thông số**: Ghi nhớ đồng thời giọng gốc, Tông giọng (Pitch st), Tốc độ (Speed), Bộ lọc Formant, Bass cut, Treble crisp và Volume boost.
- **Lưu trữ vĩnh viễn (LocalStorage)**: Giữ nguyên vẹn danh sách cấu hình của bạn ngay cả khi tải lại trình duyệt.

---

### 4. 🎚️ Bộ Tinh Chỉnh Âm Thanh & Giọng Mộc (Dry Voice)
- **Tông giọng / Độ cao giọng (Pitch / Key)**: *(Tông giọng và Độ cao giọng là một)* — Điều chỉnh độ cao bổng hoặc trầm ấm từ `-12st` đến `+12st`.
- **Tốc độ đọc (Speed / Tempo)**: Tùy chỉnh nhịp điệu từ `0.5x` đến `2.2x`.
- **Bộ lọc âm thanh mộc**:
  - `Formant Boost`: Cộng hưởng vòm họng trẻ em tự nhiên.
  - `Bass Cut`: Cắt dải trầm ù rền.
  - `Treble Crisp`: Tăng độ bén và sáng rõ từng chữ.
  - `Volume Boost`: Khuếch đại âm lượng lên đến 180%.
  - **100% Giọng Mộc (No Reverb / No Echo)**: Không dội âm, âm thanh sạch sẽ để lồng video CapCut.

---

### 5. 📊 3 Ô Thẻ Thống Kê Kịch Bản Đẹp Mắt
- **Ô Ký tự (Live Counter)**: Đếm ký tự thời gian thực.
- **Ô Số từ (Word Count)**: Thống kê số từ chuẩn xác.
- **Ô Thời gian đọc (Estimated Duration)**: Tự động tính toán thời lượng phát thanh dựa trên tốc độ giọng đã chọn.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Getting Started)

### Yêu cầu môi trường
- **Node.js**: Phiên bản 18+ trở lên.
- **NPM** hoặc **Yarn** / **PNPM**.

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Thiết lập biến môi trường
Tạo file `.env` tại thư mục gốc:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```
> *Lưu ý: Nếu không cung cấp API Key, hệ thống tự động chạy động cơ Fast HD Không Giới Hạn.*

### 3. Khởi động môi trường phát triển (Dev Server)
```bash
npm run dev
```
Truy cập tại: `http://localhost:3000`

### 4. Xây dựng bản phát hành Production
```bash
npm run build
npm start
```

---

## 📁 Cấu Trúc Dự Án (Project Structure)

```text
├── server.ts                             # Backend Express, API TTS Proxy & Quota Cooldown
├── src/
│   ├── main.tsx                          # Entry point React Vite
│   ├── App.tsx                           # Giao diện chính Đồng Đồng TTS Studio
│   ├── index.css                         # Cấu hình Tailwind CSS & hiệu ứng
│   ├── components/
│   │   ├── Header.tsx                    # Thanh điều hướng thương hiệu Đồng Đồng TTS Studio
│   │   ├── VoiceSelector.tsx             # Giao diện chọn giọng thu gọn & nút phân tích audio
│   │   ├── AudioReverseAnalysisModal.tsx # Cửa sổ nhận file audio & phân tích ngược trích xuất giọng
│   │   ├── SaveVoiceModal.tsx            # Cửa sổ đặt tên & lưu loại giọng tùy chỉnh
│   │   ├── TextEditor.tsx                # Vùng soạn thảo với 3 ô thẻ thống kê phát sáng
│   │   ├── AudioControls.tsx             # Điều khiển Tông giọng / Độ cao, Tốc độ, Bộ lọc
│   │   ├── AudioWaveform.tsx             # Sóng âm thanh trực quan & bộ phát nhạc
│   │   ├── HistoryShelf.tsx              # Kệ lịch sử các bản thu đã tạo
│   │   ├── ExportModal.tsx               # Cửa sổ xuất file WAV Studio Master
│   │   └── TikTokTipsModal.tsx           # Hướng dẫn mẹo chèn file vào CapCut / TikTok
│   ├── types/
│   │   └── tts.ts                        # Định nghĩa TypeScript Types
│   └── utils/
│       ├── voiceAnalyzer.ts              # Thuật toán Autocorrelation & phân tích ngược F0/Tempo
│       ├── audioDsp.ts                   # Bộ xử lý Web Audio API & kết xuất WAV
│       ├── presets.ts                    # Danh sách giọng mẫu chuẩn
│       └── sampleTexts.ts                # Kho kịch bản mẫu
├── metadata.json                         # Thông tin cấu hình ứng dụng
├── package.json                          # Danh sách thư viện phụ thuộc
└── README.md                             # Tài liệu hướng dẫn sử dụng Đồng Đồng TTS Studio
```

---

## 📄 Bản Quyền (License)

Dự án được xây dựng và phát hành theo giấy phép **MIT License**. Mọi quyền tự do sử dụng cho mục đích cá nhân và thương mại.
