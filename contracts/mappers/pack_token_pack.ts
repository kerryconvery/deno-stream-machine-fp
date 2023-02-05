export function unpackPageToken(packedPageToken: string): Record<string, string> {
  return packedPageToken
    .split(",")
    .map((providerAndOffset) => providerAndOffset.split(":"))
    .reduce((pageToken, [provider, offset]) => {
      pageToken[provider] = offset;
      return pageToken;
    }, {} as Record<string, string>);
}

export function packPageTokens(unpackedPageToken: Record<string, string>): string {
  return Object.entries(unpackedPageToken)
    .map(([provider, offset]) => `${provider}:${offset}`)
    .join(",");
}