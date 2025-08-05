// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // এটি Next.js কে স্ট্যাটিক HTML ফাইল হিসেবে এক্সপোর্ট করতে বলবে।
  // GitHub Pages একটি Node.js সার্ভার চালাতে পারে না, তাই স্ট্যাটিক এক্সপোর্ট প্রয়োজন।
  output: 'export', 

  // যদি আপনার GitHub Pages URL-এ বেস পাথ থাকে (যেমন: https://yourusername.github.io/your-repo-name/),
  // তাহলে এটি যোগ করুন। আপনার ক্ষেত্রে, এটি 'mojox_ai' হবে যদি আপনার রিপোজিটরির নাম 'mojox_ai' হয়।
  basePath: '/mojox_ai', // আপনার GitHub রিপোজিটরির নাম অনুযায়ী এটি পরিবর্তন করুন
  assetPrefix: '/mojox_ai/', // আপনার GitHub রিপোজিটরির নাম অনুযায়ী এটি পরিবর্তন করুন
};

module.exports = nextConfig;