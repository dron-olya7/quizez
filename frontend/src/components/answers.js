import {UrlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Answers {

    backButton = null;
    quizResult = null;
    test = null;

    constructor() {
        this.routeParams = UrlManager.getQueryParams();
        this.userInfo = Auth.getUserInfo();

        this.init();
    }

    async init() {
        if (!this.userInfo) {
            location.href = '#/';
        }
        if (this.routeParams.id) {
            try {
                const quizResult = await CustomHttp.request(config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' + this.userInfo.userId);
                this.test = quizResult.test;
                if (this.test) {
                    if (this.test.error) {
                        throw new Error(this.test.error);
                    }
                    this.showTitle();
                    this.showUserInfo();
                    this.showAnswers();
                    this.addBackLink();
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    showTitle() {
        document.getElementById('answers-title').innerText = this.test.name;

    }

    showUserInfo() {
        const userEmail = localStorage.getItem('activeEmail');
        const userText = `${this.userInfo.fullName}, ${userEmail}`;
        const answersUser = document.getElementById('answers-user');
        answersUser.innerHTML = `Тест выполнил <span>${userText}</span>`;
    }

    showAnswers() {
        this.backButton = document.getElementById('back');
        this.answersList = document.getElementById('answers-list');
        this.loadQuestions();
    }

    loadQuestions() {
        this.answersList.innerHTML = '';
        const questions = this.test.questions;

        questions.forEach((item, index) => {
            const answersListItem = document.createElement('div');
            answersListItem.className = 'answers-list-item';

            const questionTitle = document.createElement('div');
            questionTitle.className = 'answers-question-title';
            questionTitle.innerHTML = `<span>Вопрос ${index + 1}:</span> ${item.question}`;

            const questionOptions = document.createElement('div');
            questionOptions.className = 'answers-question-options';

            item.answers.forEach((answer, index) => {

                const inputId = `answers-question-option-${answer.id}`;
                const inputElement = document.createElement('input');
                inputElement.className = 'option-answer';

                inputElement.setAttribute('id', inputId);
                inputElement.setAttribute('type', 'radio');
                inputElement.setAttribute('name', `answers-question-${index}`);
                inputElement.setAttribute('value', answer.id);
                inputElement.setAttribute('disabled', 'disabled');

                const labelElement = document.createElement('label');
                labelElement.setAttribute('for', inputId);
                labelElement.innerText = answer.answer;

                const answerOption = document.createElement('div');
                answerOption.className = 'answers-question-option';
                answerOption.appendChild(inputElement);
                answerOption.appendChild(labelElement);

                if (answer.correct === true) {
                    answerOption.classList.add('correct');
                } else if (answer.correct === false) {
                    answerOption.classList.add('wrong');
                }

                questionOptions.appendChild(answerOption);
            });

            answersListItem.appendChild(questionTitle);
            answersListItem.appendChild(questionOptions);
            this.answersList.appendChild(answersListItem);
        });
    }
    addBackLink() {
        const answersLink = document.getElementById('back');
        answersLink.href = '#/result?id=' + this.routeParams.id;
    }
}
