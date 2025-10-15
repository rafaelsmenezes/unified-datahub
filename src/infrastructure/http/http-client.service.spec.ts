import axios from 'axios';
import { Readable } from 'stream';
import { HttpClientService } from './http-client.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpClientService', () => {
  let service: HttpClientService;

  beforeEach(() => {
    service = new HttpClientService();
    jest.clearAllMocks();
  });

  it('returns the stream provided by axios.get', async () => {
    const stream = Readable.from(['chunk1', 'chunk2']);
    mockedAxios.get.mockResolvedValue({ data: stream } as any);

    const result = await service.getStream('http://example.com/resource');

    expect(result).toBe(stream);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('forwards config and ensures responseType is set to "stream"', async () => {
    const stream = Readable.from(['data']);
    const inputConfig = { headers: { 'x-custom': '1' } };
    let capturedUrl: string | undefined;
    let capturedConfig: any;

    mockedAxios.get.mockImplementation((url: string, cfg?: any) => {
      capturedUrl = url;
      capturedConfig = cfg;
      return Promise.resolve({ data: stream });
    });

    const result = await service.getStream(
      'http://example.org/stream',
      inputConfig as any,
    );

    expect(result).toBe(stream);
    expect(capturedUrl).toBe('http://example.org/stream');
    expect(capturedConfig).toEqual(
      expect.objectContaining({
        headers: inputConfig.headers,
        responseType: 'stream',
      }),
    );
  });
});
