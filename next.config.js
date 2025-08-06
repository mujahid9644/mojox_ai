/** @type {import('next').NextConfig} */
const nextConfig = {
  // এই অংশটি আপনার সাইটকে স্ট্যাটিক HTML হিসেবে এক্সপোর্ট করতে সাহায্য করবে
  output: 'export',

  // যেহেতু আপনার সাইটটি একটি সাব-ডোমেইনে (mujahi9644.github.io/mojox_ai) হোস্ট করা হচ্ছে,
  // তাই এই দুটি লাইন যোগ করা অত্যন্ত গুরুত্বপূর্ণ।
  basePath: '/mojox_ai',
  assetPrefix: '/mojox_ai/',

  // ছবির কম্পোনেন্ট ব্যবহারের জন্য নিচের লাইনটি যোগ করতে পারেন
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;