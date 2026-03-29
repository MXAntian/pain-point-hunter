#!/usr/bin/env node
/**
 * pain-point-hunter / fetch_reviews.js
 * 抓取App Store和TapTap的用户评价
 * 用法: node fetch_reviews.js <游戏名> [平台]
 * 平台: appstore | taptap | all (默认all)
 */

const GAME_NAME = process.argv[2] || '王者荣耀';
const PLATFORM = process.argv[3] || 'all';

// ── App Store 评价抓取（iTunes Search API，无需认证） ──────────────────────

async function fetchAppStoreReviews(gameName, limit = 100) {
  // 先搜索游戏ID
  const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(gameName)}&entity=software&country=cn&limit=5`;
  let reviews = [];

  try {
    const res = await fetch(searchUrl);
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      console.log('[AppStore] 未找到游戏:', gameName);
      return [];
    }

    const app = data.results[0];
    const appId = app.trackId;
    const appName = app.trackName;
    console.log(`[AppStore] 找到: ${appName} (ID: ${appId})`);

    // iTunes Reviews API (RSS feed)
    const rssUrl = `https://itunes.apple.com/cn/rss/customerreviews/page=1/id=${appId}/sortBy=mostRecent/json`;
    const rssRes = await fetch(rssUrl);
    const rssData = await rssRes.json();

    const entries = rssData?.feed?.entry || [];
    reviews = entries.map(e => ({
      platform: 'AppStore',
      game: appName,
      user: e.author?.name?.label || '匿名',
      rating: e["im:rating"]?.label || 0,
      version: e["im:version"]?.label || '',
      title: e.title?.label || '',
      content: e.content?.label || '',
      date: e.updated?.label || '',
    }));
    console.log(`[AppStore] 获取 ${reviews.length} 条评价`);
  } catch (err) {
    console.log('[AppStore] 抓取失败:', err.message);
  }

  return reviews;
}

// ── TapTap 评价抓取 ─────────────────────────────────────────────────────────

async function fetchTapTapReviews(gameName, limit = 100) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://www.taptap.cn/',
  };

  let reviews = [];

  try {
    // TapTap Search API
    const searchRes = await fetch(
      `https://www.taptap.cn/api/community/search/posts?keyword=${encodeURIComponent(gameName)}&type=app&limit=5`,
      { headers }
    );
    const searchData = await searchRes.json();
    const hits = searchData?.data?.rows || [];

    if (hits.length === 0) {
      console.log('[TapTap] 未找到游戏:', gameName);
      return [];
    }

    const appId = hits[0].target?.id;
    const appName = hits[0].target?.title || gameName;
    console.log(`[TapTap] 找到: ${appName} (ID: ${appId})`);

    // 获取评价列表
    const reviewsRes = await fetch(
      `https://www.taptap.cn/api/community/app/${appId}/feeds?type=review&limit=${limit}&from=0`,
      { headers }
    );
    const reviewsData = await reviewsRes.json();
    const items = reviewsData?.data?.rows || [];

    reviews = items.map(item => ({
      platform: 'TapTap',
      game: appName,
      user: item.author?.name || '匿名',
      rating: item.rating || 0,
      version: item.version || '',
      title: item.title || '',
      content: item.body?.replace(/<[^>]+>/g, '') || item.body || '',
      date: item.created_at || '',
      likes: item.likes_count || 0,
    }));
    console.log(`[TapTap] 获取 ${reviews.length} 条评价`);
  } catch (err) {
    console.log('[TapTap] 抓取失败:', err.message);
  }

  return reviews;
}

// ── 主程序 ─────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔍 痛点猎人 - 正在抓取"${GAME_NAME}"的用户评价...\n`);

  let allReviews = [];

  if (PLATFORM === 'all' || PLATFORM === 'appstore') {
    const appstoreReviews = await fetchAppStoreReviews(GAME_NAME);
    allReviews.push(...appstoreReviews);
  }

  if (PLATFORM === 'all' || PLATFORM === 'taptap') {
    const taptapReviews = await fetchTapTapReviews(GAME_NAME);
    allReviews.push(...taptapReviews);
  }

  console.log(`\n✅ 共抓取 ${allReviews.length} 条评价`);

  // 输出JSON备用
  const fs = require('fs');
  fs.writeFileSync('/workspace/tmp/pain_point_raw.json', JSON.stringify(allReviews, null, 2));
  console.log('原始数据已保存到 /workspace/tmp/pain_point_raw.json');

  // 输出摘要
  const scoreGroups = {};
  allReviews.forEach(r => {
    const k = String(r.rating);
    scoreGroups[k] = (scoreGroups[k] || 0) + 1;
  });
  console.log('\n评分分布:', scoreGroups);
}

main().catch(console.error);
