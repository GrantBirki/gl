import { describe, expect, it, vi } from 'vitest';

type SiteConfig = {
  origin: string;
  basePathname: string;
  trailingSlash: boolean;
};

type BlogConfig = {
  post: { permalink: string };
  list: { pathname: string };
  category: { pathname: string };
  tag: { pathname: string };
};

type PostFixture = {
  id: string;
  slug: string;
  data: Record<string, unknown>;
  readingTime?: number;
};

const baseSite: SiteConfig = {
  origin: 'https://example.com',
  basePathname: '/base',
  trailingSlash: false,
};

const baseBlog: BlogConfig = {
  post: { permalink: '/blog/%category%/%year%/%month%/%day%/%slug%' },
  list: { pathname: '/blog' },
  category: { pathname: 'category' },
  tag: { pathname: 'tag' },
};

const createPost = ({ id, slug, data, readingTime }: PostFixture) => ({
  id,
  slug,
  data,
  render: async () => {
    const result: {
      Content: () => string;
      remarkPluginFrontmatter?: { readingTime: number };
    } = {
      Content: () => 'content',
    };

    if (readingTime !== undefined) {
      result.remarkPluginFrontmatter = { readingTime };
    }

    return result;
  },
});

const buildFixtures = () => [
  createPost({
    id: '1',
    slug: 'posts/first-post',
    data: {
      title: 'First',
      tags: ['Tag One', 'Tag Two'],
      category: 'News',
      publishDate: new Date('2023-01-02T10:00:00Z'),
      draft: false,
    },
    readingTime: 3,
  }),
  createPost({
    id: '2',
    slug: 'second-post',
    data: {
      title: 'Second',
      tags: ['Tag Two'],
      category: 'Updates',
      publishDate: new Date('2023-01-03T10:00:00Z'),
      draft: false,
    },
    readingTime: 5,
  }),
  createPost({
    id: '3',
    slug: 'third-post',
    data: {
      title: 'Third',
      tags: [],
      category: 'Misc',
      publishDate: new Date('2023-01-01T10:00:00Z'),
      draft: true,
    },
    readingTime: 2,
  }),
  createPost({
    id: '4',
    slug: 'fourth-post',
    data: {
      title: 'Fourth',
      tags: undefined,
      category: undefined,
      publishDate: new Date('2023-01-04T10:00:00Z'),
      draft: false,
    },
  }),
];

const loadBlogModule = async (posts: ReturnType<typeof createPost>[]) => {
  vi.resetModules();

  const getCollection = vi.fn().mockResolvedValue(posts);

  vi.doMock('astro:content', () => ({
    getCollection,
  }));

  vi.doMock('~/config/site/config.js', () => ({
    SITE: baseSite,
    BLOG: baseBlog,
    DATE_FORMATTER: null,
  }));

  const blog = await import('../../src/utils/blog');

  return { blog, getCollection };
};

describe('blog utilities', () => {
  it('normalizes, sorts, filters, and caches posts', async () => {
    const { blog, getCollection } = await loadBlogModule(buildFixtures());

    const posts = await blog.fetchPosts();

    expect(getCollection).toHaveBeenCalledTimes(1);
    expect(posts.map((post) => post.id)).toEqual(['4', '2', '1']);
    expect(posts[2].slug).toBe('first-post');
    expect(posts[2].category).toBe('news');
    expect(posts[2].tags).toEqual(['tag-one', 'tag-two']);
    expect(posts[2].permalink).toBe('blog/news/2023/01/02/first-post');
    expect(posts[2].readingTime).toBe(3);
    expect(posts[0].permalink).toBe('blog/2023/01/04/fourth-post');

    const cached = await blog.fetchPosts();
    expect(getCollection).toHaveBeenCalledTimes(1);
    expect(cached).toBe(posts);
  });

  it('finds posts, tags, and categories from the cached data', async () => {
    const { blog } = await loadBlogModule(buildFixtures());

    const posts = await blog.fetchPosts();
    const taglessPost = posts.find((post) => post.id === '4');
    if (taglessPost) {
      taglessPost.tags = undefined;
    }

    const bySlugs = await blog.findPostsBySlugs(['first-post', 'missing']);
    expect(bySlugs.map((post) => post.id)).toEqual(['1']);

    const byIds = await blog.findPostsByIds(['2', '4']);
    expect(byIds.map((post) => post.id)).toEqual(['2', '4']);

    const latest = await blog.findLatestPosts({ count: 2 });
    expect(latest.map((post) => post.id)).toEqual(['4', '2']);

    const defaultLatest = await blog.findLatestPosts({});
    expect(defaultLatest.map((post) => post.id)).toEqual(['4', '2', '1']);

    const tags = await blog.findTags();
    expect(tags.sort()).toEqual(['tag-one', 'tag-two']);

    const categories = await blog.findCategories();
    expect(categories.sort()).toEqual(['news', 'updates']);
  });

  it('returns empty arrays for non-array inputs', async () => {
    const { blog, getCollection } = await loadBlogModule(buildFixtures());

    const bySlugs = await blog.findPostsBySlugs(null as unknown as string[]);
    const byIds = await blog.findPostsByIds(undefined as unknown as string[]);

    expect(bySlugs).toEqual([]);
    expect(byIds).toEqual([]);
    expect(getCollection).not.toHaveBeenCalled();
  });
});
