declare module "qrcode" {
  function toDataURL(
    text: string,
    options?: { type?: string; margin?: number; width?: number; color?: { dark?: string; light?: string } }
  ): Promise<string>;
}
