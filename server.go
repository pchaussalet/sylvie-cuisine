package main

import (
	"net/http"
	"net/url"
	"io/ioutil"
	"encoding/json"
	"os"
	"github.com/sendgrid/sendgrid-go"
	"fmt"
	"html/template"
	"bytes"
)

func validateCaptcha(captcha string) bool {
	secret := os.Getenv("RECAPTCHA_KEY")
	resp, _ := http.PostForm("https://www.google.com/recaptcha/api/siteverify", url.Values{"secret": {secret}, "response": {captcha}})
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	bodyBytes := []byte(string(body))
	type Validation struct {
		Success 	bool 	`json:"success"`
		ErrorCodes 	string 	`json:"error-codes"`
	}
	var validation Validation
	json.Unmarshal(bodyBytes, &validation)
	return validation.Success
}

func handler(w http.ResponseWriter, r *http.Request) {
	type Contact struct {
		Name 		string
		Email		string
		Message		string
		Allergy 	string
	}
	w.Header().Set("Access-Control-Allow-Origin", os.Getenv("SOURCE_DOMAIN"))
	if r.Method == "POST" {
		r.ParseForm()
		captcha := r.FormValue("captcha")
		if validateCaptcha(captcha) {
			var allergy string
			if r.FormValue("allergy") == "true" {
				allergy = "Oui"
			} else {
				allergy = "Non"
			}
			contact := Contact{r.FormValue("name"), r.FormValue("email"), r.FormValue("message"), allergy}
			sendgridKey := os.Getenv("SENDGRID_API_KEY")
			sg := sendgrid.NewSendGridClientWithApiKey(sendgridKey)
			emailMessage := sendgrid.NewMail()
			emailMessage.AddTo("pchaussalet@gmail.com")
			emailMessage.AddToName("Sylvie Cuisine")
			emailMessage.SetSubject("Nouveau contact sur le site.")
			t, _ := template.ParseFiles("email.html")
			var b bytes.Buffer
			t.Execute(&b, contact)
			html := b.String()
			emailMessage.SetHTML(html)
			emailMessage.SetFrom(contact.Email)
			if r := sg.Send(emailMessage); r == nil {
				fmt.Println("Email from " + contact.Email + " sent.")
			} else {
				fmt.Println(r)
				w.WriteHeader(http.StatusBadRequest)
			}
		} else {
			w.WriteHeader(http.StatusForbidden)
		}
	}
}

func main() {
	http.HandleFunc("/", handler)
	http.ListenAndServe(":" + os.Getenv("LISTEN_PORT"), nil)
}
