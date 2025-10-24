import { registerAs } from '@nestjs/config';

export default registerAs('sources', () => ({
  source1: {
    name: 'source1',
    url: process.env.SOURCE1_URL,
  },
  source2: {
    name: 'source2',
    url: process.env.SOURCE2_URL,
  },
}));
