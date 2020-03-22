import axios from 'axios';

export interface TvDbCredentials {
  apikey: string;
  username: string;
  userkey: string;
}

export interface TvDbSettings {
  refreshToken: number;
}

export interface TokenResponse {
  token: string;
}

export class TVDB {
  private httpClient = axios.create({
    baseURL: 'https://api.thetvdb.com/',
    timeout: 3000,
  });
  private refreshTimer: any;

  constructor(
    private credentials: TvDbCredentials,
    private settings: TvDbSettings = { refreshToken: 72000000 },
  ) {}

  async authorize() {
    const response = await this.httpClient.post<TokenResponse>(
      '/login',
      this.credentials,
    );
    this.setHttpToken(response.data.token);
    setTimeout(() => this.refreshToken(), 3000);
  }

  private async refreshToken() {
    const response = await this.httpClient.get<TokenResponse>('/refresh_token');
    console.log('new token!', response);
    this.setHttpToken(response.data.token);
  }

  private setHttpToken(token: string) {
    this.httpClient.defaults.headers.Authorization = 'Bearer ' + token;

    if (this.settings.refreshToken) {
      this.refreshTimer = setTimeout(
        () => this.refreshToken(),
        this.settings.refreshToken,
      );
    }
  }
}
