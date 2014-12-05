[Constructor(optional BodyInit body, optional ResponseInit init),
 Exposed=(Window,Worker)]
interface Response {
  static Response error();
  static Response redirect(USVString url, optional unsigned short status = 302);

  readonly attribute ResponseType type;

  readonly attribute USVString url;
  readonly attribute unsigned short status;
  readonly attribute ByteString statusText;
  readonly attribute Headers headers;

  Response clone();
};
Response implements Body;

dictionary ResponseInit {
  unsigned short status = 200;
  ByteString statusText = "OK";
  HeadersInit headers;
};

enum ResponseType { "basic", "cors", "default", "error", "opaque" };
