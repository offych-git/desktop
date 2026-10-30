import { defineConfig, defineField, defineType } from 'sanity';
import { structureTool } from 'sanity/structure';

const post = defineType({
  name: 'post',
  title: 'Blog articles',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Article title', type: 'string', validation: Rule => Rule.required().min(10) }),
    defineField({ name: 'slug', title: 'URL slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: Rule => Rule.required() }),
    defineField({ name: 'description', title: 'Short summary / SEO description', type: 'text', rows: 3, validation: Rule => Rule.required().min(30).max(300) }),
    defineField({ name: 'date', title: 'Publication date', type: 'date', initialValue: () => new Date().toISOString().slice(0,10), validation: Rule => Rule.required() }),
    defineField({ name: 'category', title: 'Category', type: 'string', initialValue: 'AI Search', validation: Rule => Rule.required() }),
    defineField({ name: 'readTime', title: 'Reading time (minutes)', type: 'number', initialValue: 5, validation: Rule => Rule.required().min(1).integer() }),
    defineField({ name: 'draft', title: 'Hide from website (draft)', type: 'boolean', initialValue: false, description: 'Turn on to keep a published document off the public site.' }),
    defineField({ name: 'coverImage', title: 'Cover image', type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', type: 'string', title: 'Image alternative text', validation: Rule => Rule.required() })] }),
    defineField({
      name: 'body',
      title: 'Article content',
      type: 'array',
      of: [{
        type: 'block',
        styles: [{ title: 'Normal', value: 'normal' },{ title: 'Heading 2', value: 'h2' },{ title: 'Heading 3', value: 'h3' },{ title: 'Quote', value: 'blockquote' }],
        lists: [{ title: 'Bullet', value: 'bullet' },{ title: 'Numbered', value: 'number' }],
        marks: {
          decorators: [{ title: 'Bold', value: 'strong' },{ title: 'Italic', value: 'em' },{ title: 'Code', value: 'code' }],
          annotations: [{ name: 'link', title: 'Link', type: 'object', fields: [defineField({ name: 'href', type: 'url', title: 'URL', validation: Rule => Rule.uri({ scheme: ['http','https','mailto'] }) })] }]
        }
      }, { type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', type: 'string', title: 'Image description', validation: Rule => Rule.required() })] }]
    })
  ],
  preview: { select: { title: 'title', subtitle: 'category', media: 'coverImage' } }
});

export default defineConfig({
  name: 'geowork',
  title: 'GeoWork · Article Editor',
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'replace-me',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  basePath: '/admin',
  plugins: [structureTool()],
  schema: { types: [post] }
});
