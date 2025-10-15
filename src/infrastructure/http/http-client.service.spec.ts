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

  it('retries on transient get failures and succeeds', async () => {
    const expected = { a: 1 };
    mockedAxios.get
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ data: expected } as any);

    const res = await service.get<typeof expected>('http://ok');
    expect(res).toBe(expected);
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  it('retries and eventually throws after max attempts', async () => {
    mockedAxios.get.mockRejectedValue(new Error('down'));

    await expect(service.get('http://down')).rejects.toThrow('down');
    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
  });

  it('retries on timeout-like errors (ECONNABORTED) and fails after attempts', async () => {
    const timeoutErr: any = new Error('timeout');
    timeoutErr.code = 'ECONNABORTED';
    mockedAxios.get.mockRejectedValue(timeoutErr);

    await expect(service.get('http://timeout')).rejects.toThrow('timeout');
    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
  });
});
