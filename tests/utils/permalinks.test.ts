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

const baseSite: SiteConfig = {
  origin: 'https://example.com',
  basePathname: '/base',
  trailingSlash: false,
};

const baseBlog: BlogConfig = {
  post: { permalink: '/blog/%category%/%year%/%month%/%day%/%slug%' },
  list: { pathname: '/blog' },
  category: { pathname: 'topics' },
  tag: { pathname: 'tags' },
};

const loadPermalinks = async ({
  siteOverrides = {},
  blogOverrides = {},
}: {
  siteOverrides?: Partial<SiteConfig>;
  blogOverrides?: Partial<BlogConfig>;
} = {}) => {
  vi.resetModules();

  const SITE = { ...baseSite, ...siteOverrides };
  const BLOG = {
    post: { ...baseBlog.post, ...(blogOverrides.post ?? {}) },
    list: { ...baseBlog.list, ...(blogOverrides.list ?? {}) },
    category: { ...baseBlog.category, ...(blogOverrides.category ?? {}) },
    tag: { ...baseBlog.tag, ...(blogOverrides.tag ?? {}) },
  };

  vi.doMock('~/config/site/config.js', () => ({
    SITE,
    BLOG,
    DATE_FORMATTER: null,
  }));

  return await import('../../src/utils/permalinks');
};

describe('permalinks', () => {
  it('builds permalinks without trailing slashes when disabled', async () => {
    const { trimSlash, cleanSlug, getPermalink, getHomePermalink, getBlogPermalink, getAsset, getCanonical } =
      await loadPermalinks();

    expect(trimSlash('/one/two/')).toBe('one/two');
    expect(cleanSlug('/Hello World/')).toBe('hello-world');
    expect(getPermalink('about')).toBe('/base/about');
    expect(getPermalink('news', 'category')).toBe('/base/topics/news');
    expect(getPermalink('news', 'tag')).toBe('/base/tags/news');
    expect(getPermalink('news', 'post')).toBe('/base/news');
    expect(getHomePermalink()).toBe('/base');
    expect(getBlogPermalink()).toBe('/base/blog');
    expect(getAsset('images/pic.png')).toBe('/base/images/pic.png');
    expect(getCanonical('/base/about/')).toBe('https://example.com/base/about');
  });

  it('adds trailing slashes when configured', async () => {
    const { getPermalink, getCanonical } = await loadPermalinks({
      siteOverrides: { trailingSlash: true },
    });

    expect(getPermalink('about')).toBe('/base/about/');
    expect(getCanonical('/base/about')).toBe('https://example.com/base/about/');
    expect(getCanonical('')).toBe('https://example.com/');
  });

  it('falls back to default blog settings when values are missing', async () => {
    const { POST_PERMALINK_PATTERN, BLOG_BASE, CATEGORY_BASE, TAG_BASE } = await loadPermalinks({
      blogOverrides: {
        post: { permalink: '' },
        list: { pathname: '' },
        category: { pathname: '' },
        tag: { pathname: '' },
      },
    });

    expect(POST_PERMALINK_PATTERN).toBe('%slug%');
    expect(BLOG_BASE).toBe('');
    expect(CATEGORY_BASE).toBe('category');
    expect(TAG_BASE).toBe('tag');
  });
});
