import { Auth } from "../services/auth.js";
import { UrlManager } from "../utils/url-manager.js";

export class Result {
  constructor() {
    this.routeParams = UrlManager.getQueryParams();
    this.init();
    document.getElementById('result-score').innerText = this.routeParams.score +
       '/' + this.routeParams.total;

    const url = new URL(location.href);
    this.resultScore = document.getElementById('result-score');
    this.resultScore.innerText = url.searchParams.get('score') +
       '/' + url.searchParams.get('total');
    this.userData = null;
    this.resultScore = null;
    this.userData = JSON.parse(sessionStorage.getItem('userData'));
    let userScore = this.userData.userScore;
    if (this.userData && userScore) {
        this.resultScore.innerText = userScore.score + '/' + userScore.total;
    }
  }

  async init() {
    const userInfo = Auth.getUserInfo();

    if (!userInfo) {
      location.href = "#/";
    }

    if (this.routeParams.id) {
      try {
        const result = await CustomHttp.request(
          config.host +
            "/tests/" +
            this.routeParams.id +
            "/result?userId=" +
            userInfo.userId
        );

        if (result) {
          if (result.error) {
            throw new Error(result.error);
          }
          document.getElementById("result-score").innerText =
            result.score + "/" + result.total;
            return;
        }
      } catch (error) {
        console.log(error);
      }
    }
    location.href = '#/';
  }
}
