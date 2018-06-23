# GraphQL + Multipart + S3 Example

This is an example express app that:

1.  Accepts url-encoded, json-body or multipart/form-data
2.  On upload, writes the file to S3
3.  Passes uploaded metadata to the resolvers for manipulation
4.  Generates signed URLs for the files (so you can keep your bucket private)

## Use

### Install

```sh
$ git clone https://github.com/dncrews/graphql-busboy-s3-example.git

$ npm install

$ npm start
```

### Configure

Set necessary values in `./lib/config.json`

### Make Requests

Load the included [postman collection](./GraphQLMultiPart.postman_collection.json) into Postman. You can then run the Mutation and then Query.
