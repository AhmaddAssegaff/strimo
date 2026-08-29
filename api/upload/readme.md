### Put chunk into s3

```bash
curl -X PUT \
  --upload-file ./chunks/chunk-aa \
  -H 'x-amz-checksum-sha256: 24CB8ebTs5T/g5ci2WFncP3MUKKg0prqIhYdt0KE0dg=' \
  'PRESIGNED_URL'
```

### Calculate SHA-256 checksum

```bash
openssl dgst -sha256 -binary ./chunks/chunk-aa | base64 -w0
```

### Split video to chunks

```bash
split -b 8M video.mp4 chunks/chunk-
```

> before split video to chunks you must hit an endpoint /api/v1/video for getting information spec of chunk
