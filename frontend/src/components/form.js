import { CustomHttp } from "../services/custom-http.js";
import { Auth } from "../services/auth.js";
import config from "../../config/config.js";

export class Form {
  constructor(page) {
    this.agreeElement = null;
    this.processElement = null;
    this.page = page;

    const accessToken = localStorage.getItem(Auth.accessTokenKey);
    if(accessToken) {
        location.href = '#/choice';
        return;
    }

    this.fields = [
      {
        name: "email",
        id: "email",
        elem: null,
        regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        valid: false,
      },
      {
        name: "password",
        id: "password",
        elem: null,
        regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
        valid: false,
      },
    ];

    if (this.page === "signup") {
      this.fields.unshift(
        {
          name: "name",
          id: "name",
          elem: null,
          regex: /^[А-Я Ё][а-я ё]+\s*$/,
          valid: false,
        },
        {
          name: "lastName",
          id: "last-name",
          elem: null,
          regex: /^[А-Я Ё][а-я ё]+\s*$/,
          valid: false,
        }
      );
    }

    const self = this;
    this.fields.forEach((item) => {
      item.elem = document.getElementById(item.id);
      item.elem.onchange = function () {
        self.validatefield.call(self, item, this);
      };
    });
    this.processElement = document.getElementById("process");
    this.processElement.onclick = function () {
      self.processForm();
    };

    if (this.page === "signup") {
      this.agreeElement = document.getElementById("agree");
      this.agreeElement.onchange = function () {
        self.validateForm();
      };
    }
  }

  validatefield(field, elem) {
    if (!elem.value || !elem.value.match(field.regex)) {
      elem.parentNode.style.borderColor = "red";
      field.valid = false;
    } else {
      elem.parentNode.removeAttribute("style");
      field.valid = true;
    }
    this.validateForm();
  }

  validateForm() {
    const validForm = this.fields.every((item) => item.valid);
    const isValid = this.agreeElement
      ? this.agreeElement.checked && validForm
      : validForm;
    if (isValid) {
      // this.processElement.removeAttribute('disabled');
      this.processElement.disabled = false;
    } else {
      // this.processElement.setAttribute('disabled', value = 'disabled');
      this.processElement.disabled = true;
    }
    return isValid;
  }

  async processForm() {
    if (this.validateForm()) {
      const email = this.fields.find((item) => item.name === "email").element
        .value;
      const password = this.fields.find((item) => item.name === "password")
        .element.value;

      if (this.page === "signup") {
        try {
          const result = await CustomHttp.request(
            config.host + "/signup",
            "POST",
            {
              name: this.fields.find((item) => item.name === "name").element
                .value,
              lastName: this.fields.find((item) => item.name === "lastName")
                .element.value,
              email: email,
              password: password,
            }
          );

          if (result) {
            if (result.error || !result.user) {
              throw new Error(result.message);
            }
          }
        } catch (error) {
          return console.log(error);
        }
      }

      try {
        const result = await CustomHttp.request(
          config.host + "/login",
          "POST",
          {
            email: email,
            password: password,
          }
        );

        if (result) {
          if (
            result.error ||
            !result.accessToken ||
            !result.refreshToken ||
            !result.fullName ||
            !result.userId
          ) {
            throw new Error(result.message);
          }

          Auth.setTokens(result.accessToken, result.refreshToken);
          Auth.setUserInfo({
            fullName: result.fullName,
            userId: result.userId,
          })
          location.href = "#/choice";
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}