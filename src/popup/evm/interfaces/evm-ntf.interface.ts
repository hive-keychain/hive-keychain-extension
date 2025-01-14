export interface EvmNFTMetadataAttribute {
  trait_type: string;
  value: string;
}

export interface EvmNFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: EvmNFTMetadataAttribute[];
}
