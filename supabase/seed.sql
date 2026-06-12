-- 可选：社区动态示例数据（在 schema.sql 执行成功后，于 SQL Editor 运行）
-- 需以有足够权限的角色执行（如 Dashboard → SQL）

insert into public.community_posts (author_name, author_avatar, content, likes_count, comments_count)
values
  (
    '小明',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    '今天排便很顺畅，继续保持！💪',
    12,
    3
  ),
  (
    '小红',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    '连续打卡第15天，肠道健康明显改善～',
    28,
    8
  ),
  (
    '健康君',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Health',
    '分享一个健康小贴士：多吃富含膳食纤维的食物有助于肠道蠕动哦！🥗',
    56,
    15
  );
