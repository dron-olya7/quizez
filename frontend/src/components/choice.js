import {CustomHttp } from "../services/custom-http.js";
import {UrlManager} from "../utils/url-manager.js";
import config from "../../config/config.js";
import { Auth } from "../services/auth.js";

export class Choice {
    constructor() {
        this.quizzes = [];
        this.testResult = null;
        this.routeParams = UrlManager.getQueryParams();
        this.init();
    }

    async init(){
        try{
            const result = await CustomHttp.request(config.host + '/tests');
            if(result){
                if(result.error){
                    throw new Error(result.error);
                }
                this.quizzes = result;
              
            }
        }catch(error){
            return console.log(error);
        }

        const userInfo = Auth.getUserInfo(); 
        if(userInfo){
            try{
                const result = await CustomHttp.request(config.host + '/tests/results?userId=' + userInfo.userId);
                if(result){
                    if(result.error){
                        throw new Error(result.error);
                    }
                    this.testResult = result;

                }
            }catch(error){
                return console.log(error);
            }    
        }
        this.prossesQuizzes();
    }


    prossesQuizzes() {
        console.log(this.quizzes);
        const choiceOptions = document.getElementById('choice-options')
        if (this.quizzes && this.quizzes.length > 0) {
            this.quizzes.forEach(quiz => {
                const self = this;
                const choiceOptionElement = document.createElement('div');
                choiceOptionElement.className = "choice-option";
                choiceOptionElement.setAttribute('data-id', quiz.id);
                choiceOptionElement.addEventListener('click', function () {
                    self.chooseQuizz(this);
                })

                const choiceOptionTextElement = document.createElement('div');
                choiceOptionTextElement.className = "choice-option-text";
                choiceOptionTextElement.innerHTML = quiz.name;

                const choiceOptionArrowElement = document.createElement('div');
                choiceOptionArrowElement.className = "choice-option-arrow";

                const result = this.testResult.find(item => item.testId === quiz.id)
                if(result){
                    const choiceOptionResultElement = document.createElement('div');
                    choiceOptionResultElement.className = "choice-option-result";
                    choiceOptionResultElement.innerHTML = '<div>Результат</div><div>'+ result.score + '/' + result.total +'</div>';
                    choiceOptionElement.appendChild(choiceOptionResultElement);
                }

                const choiceOptionImageElement = document.createElement('img');
                choiceOptionImageElement.setAttribute('src', 'static/images/arrow.png');
                choiceOptionImageElement.setAttribute('alt', 'стрелка');

                choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                choiceOptionElement.appendChild(choiceOptionTextElement);
                choiceOptionElement.appendChild(choiceOptionArrowElement);

                choiceOptions.appendChild(choiceOptionElement);


            })
        }

    }

    chooseQuizz(elem) {
        const dataId = elem.getAttribute('data-id');
        if (dataId) {
            location.href = '#/test?id=' + dataId;
        }
    }
}

