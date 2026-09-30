export interface SampleText {
  id: string;
  title: string;
  category: string;
  text: string;
  recommendedPreset: string;
}

export const SAMPLE_TEXTS: SampleText[] = [
  {
    id: 'film-review',
    title: 'Nữ Review Phim Triệu View',
    category: 'Review Phim',
    text: 'Đây là cô gái sở hữu đôi mắt có thể nhìn thấu tương lai. Nhưng vào ngày sinh nhật thứ 18, cô bàng hoàng phát hiện ra một bí mật động trời về người mẹ kế của mình...',
    recommendedPreset: 'tiktok_female_story_review',
  },
  {
    id: 'chi-google-joke',
    title: 'Chị Google Tấu Hài',
    category: 'Hài hước',
    text: 'Chào các bạn nhé! Người ta nói có công mài sắt có ngày nên kim, còn tôi mài hoài chỉ thấy mỏi tay và đói bụng thôi à nha!',
    recommendedPreset: 'tiktok_female_chi_google',
  },
  {
    id: 'cosmetic-review',
    title: 'Nữ Review Mỹ Phẩm / Vlog',
    category: 'Vlog / Review',
    text: 'Trời ơi các bà ơi! Tìm ra chân ái cho mùa hè này rồi nè! Thoa lên mát lạnh, kiềm dầu đỉnh chóp mà giá học sinh sinh viên cực kỳ luôn nha!',
    recommendedPreset: 'tiktok_female_cute',
  },
  {
    id: 'genz-daily',
    title: 'Gen Z Dạo Phố',
    category: 'Đời sống',
    text: 'Một ngày chill chill cuối tuần của tui sẽ như thế nào? Cùng theo chân tui ghé thăm một tiệm bánh nhỏ ẩn mình giữa lòng thành phố nha, bảo đảm mê mẩn!',
    recommendedPreset: 'tiktok_female_genz',
  },
  {
    id: 'intro-viral',
    title: 'Chào TikTok siêu cute',
    category: 'Mở đầu video',
    text: 'Hí lu cả nhà iu nha! Hôm nay em bé sẽ dẫn mọi người đi khám phá một điều siêu cấp đáng yêu luôn nè. Mọi người nhớ thả tim cho em bé đó nha!',
    recommendedPreset: 'tiktok_baby_cute',
  },
  {
    id: 'food-review',
    title: 'Bé review đồ ăn',
    category: 'Review ẩm thực',
    text: 'Trùi ui, cái món này ngon xỉu up xỉu down luôn các cô chú ơi! Giòn rụm bên ngoài mà béo ngậy bên trong, ăn một miếng là mê chữ ê kéo dàiiiii!',
    recommendedPreset: 'tiktok_baby_cute',
  },
  {
    id: 'fairy-tale',
    title: 'Kể chuyện cổ tích',
    category: 'Kể chuyện',
    text: 'Ngày xửa ngày xưa, ở một vương quốc kẹo ngọt xa xôi, có một chú thỏ trắng bông xù rất thích ngắm sao trời. Mỗi tối chú đều thì thầm ước mơ ngọt ngào.',
    recommendedPreset: 'tiktok_fairy_tale',
  },
  {
    id: 'goodnight',
    title: 'Chúc bé ngủ ngon',
    category: 'Gia đình',
    text: 'Đã đến giờ đi ngủ rồi đó nha các bạn ơi! Mau đắp chăn ấm, nhắm mắt lại và cùng em bé bay vào giấc mơ thần tiên thôi nào. Chúc cả nhà ngủ ngoan!',
    recommendedPreset: 'tiktok_fairy_tale',
  },
  {
    id: 'funny-troll',
    title: 'Em bé mách mẹ',
    category: 'Hài hước',
    text: 'Mẹ ơi mẹ! Ba lại giấu tiền dưới gối kìa mẹ ơi! Con thấy rõ ràng luôn nha, lát mẹ mua kem cho con đi rồi con chỉ chỗ cho mẹ nè hi hi!',
    recommendedPreset: 'tiktok_chipmunk_baby',
  },
  {
    id: 'motivational-kid',
    title: 'Cổ vũ năng lượng',
    category: 'Động lực',
    text: 'Hôm nay mọi người đi làm đi học có mệt hông nè? Đừng lo nha, em bé gửi một triệu chiếc ôm ấm áp đến cho mọi người nè! Cố lên nha, bạn giỏi nhất trần đời!',
    recommendedPreset: 'tiktok_sweet_girl',
  },
];
