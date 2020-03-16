'use strict';

const path = require('path');
const groupBy = require('lodash.groupby');
const cloneDeepWith = require('lodash.clonedeepwith');

function identity (input) {
    return input;
}

function paginate (filePath, collection, fileName, files, iteratee) {
    const allPosts = collection.filter((colItem) => Boolean(colItem.date));
    const origFile = files[fileName];
    const ext      = path.extname(fileName);
    const baseName = filePath || path.basename(fileName, ext);

    const postsByYear = groupBy(allPosts, (post) => new Date(post.date).getFullYear());
    const years       = Object.keys(postsByYear).sort().reverse();
    const latestYear  = years[0];

    let lastYear = origFile;

    // no posts had date field :(
    if (!years.length) {
        return;
    }

    origFile.pagination = {
        year: latestYear,
        posts: postsByYear[latestYear].map(iteratee)
    };

    years.forEach((year, idx) => {
        if (idx === 0) {
            return;
        }

        const posts = postsByYear[year];
        const cloneName = `${baseName}-${year}${ext}`;

        const currentYear = cloneDeepWith(origFile, (value) => {
            if (Buffer.isBuffer(value)) {
                return value.slice();
            }
        });

        lastYear.pagination.next = currentYear;
        currentYear.pagination = {
            year,
            prev: lastYear,
            posts: posts.map(iteratee)
        }

        files[cloneName] = currentYear;

        lastYear = currentYear;
    });
}

module.exports = (opts) => {
    const options = {iteratee: identity, ...opts};

    return (files, metalsmith, done) => {
        const {collections} = metalsmith.metadata();

        for (const file of Object.keys(files)) {
            const colName = files[file].paginate;
            const filePath = options.path ? options.path.replace(':collection', colName) : '';

            if (colName) {
                paginate(filePath, collections[colName], file, files, options.iteratee);
            }
        }

        done();
    };
};
