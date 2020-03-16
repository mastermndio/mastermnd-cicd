# metalsmith-yearly-pagination

[![Build Status](https://github.com/phillipj/metalsmith-yearly-pagination/workflows/Tests/badge.svg)](https://github.com/phillipj/metalsmith-yearly-pagination/actions?workflow=Tests)

This plug-in makes [metalsmith-collections](https://github.com/segmentio/metalsmith-collections) "paginatable". It does so by creating virtual files which contain the information about the collection as well as the previous and next page.

You **must** use this in conjunction with [metalsmith-collections](https://github.com/segmentio/metalsmith-collections)!

## Usage

Firstly you must create a file that contains the information over which collection you want to paginate and the template name:

`blog.md`

```markdown
---
template: TEMPLATE-NAME.EXT
paginate: posts
---
```

Note: if you give the page a title and use the [metalsmith-permalinks](https://github.com/segmentio/metalsmith-permalinks) plug-in you might get some weird results.

```js
const Metalsmith  = require('metalsmith');
const collections = require('metalsmith-collections');
const pagination  = require('metalsmith-yearly-pagination');

Metalsmith(__dirname)
  .use(collections({
    blog: {
      pattern: 'content/blog/*.md',
      sortBy: 'date',
      reverse: true
    }
  }))
  .use(pagination({
    path: 'blog/page'
  }))
  .use(templates('ENGINE-NAME'))
  // ...
  .build();
```

## Options

| name | description |
|:-----|:------------|
|iteratee|Function called for each post (optional) |
|path|The path were the files will be outputted to. Appended with "-$YEAR.html" where $YEAR is the year the posts has been grouped by. So "blog/page" would for example result in the second page being rendered as `blog/page-2015.html`, if there were any posts in 2015. You can also use the placeholder ':collection' to insert the name of the collection. (optional)|

## Templates

The pagination info won't be of any use to you if you don't render it. Each (virtual) pagination file will contain a new object under the key "pagination" which contains the following info:

| name | description |
|:-----|:------------|
|year|The year the current posts has been grouped by|
|posts|The posts objects from the collection|
|prev|The previous page object|
|next|The next page object|

You can then use this info in your template.

```handlebars
<h1>Posts from {{pagination.year}}</h1>
{{#each collections.blog.posts}}
  <li class="post">
    <h2 class="entry-title">
      <a href="{{ path }}" rel="bookmark">{{ title }}</a>
    </h2>
    <article class="entry-summary">
      {{ excerpt }}
    </article>
    <footer>
      <a href="{{ path }}" class="button">Read More</a>
    </footer>
  </li>
{{/each}}

{{#if pagination}}
  <nav class="pagination">
    {{#if pagination.next}}
      <a href="{{pagination.next.path}}">&lt; Prev</a>
    {{/if}}
    {{#if pagination.prev}}
      <a href="{{pagination.prev.path}}">Next &gt;</a>
    {{/if}}
  </nav>
{{/if}}
```

Note: This example also uses the [metalsmith-permalinks](https://github.com/segmentio/metalsmith-permalinks) plug-in.

## Advanced usage

It's made for extensibility by allowing you to pass a `options.iteratee` function which are called for *every* collection post.

Example below illustrates this by displaying the `excerpt` of the top 10 posts per year, follow by posts only listed by its title.

**Metalsmith setup**

```js
const Metalsmith  = require('metalsmith');
const collections = require('metalsmith-collections');
const pagination  = require('metalsmith-yearly-pagination');

Metalsmith(__dirname)
  .use(collections({
    blog: {
      pattern: 'content/blog/*.md',
      sortBy: 'date',
      reverse: true
    }
  }))
  .use(pagination({
    path: 'blog/page',
    iteratee: (post, idx) => ({
      post,
      displayExcerpt: idx < 10,
    })
  }))
  .use(templates('ENGINE-NAME'))
  // ...
  .build();
```

**Template**

```handlebars
{{#each collections.blog.posts}}
  <li class="post">
    <h2 class="entry-title">
      <a href="{{ post.path }}" rel="bookmark">{{ post.title }}</a>
    </h2>
    {{#if displayExcerpt}}
      <article class="entry-summary">
        {{ post.excerpt }}
      </article>
    {{/if}}
    <footer>
      <a href="{{ post.path }}" class="button">Read More</a>
    </footer>
  </li>
{{/each}}
```

## Contributing

This is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [contribution guide](CONTRIBUTING.md) for more details.

**This project was originally a fork of the [metalsmith-paginate](https://github.com/RobinThrift/metalsmith-paginate).**
