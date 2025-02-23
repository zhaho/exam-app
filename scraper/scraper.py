import re
import time
import json
import requests
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def scraper():
    # Enable detach mode to keep Chrome open
    chrome_options = Options()
    chrome_options.add_experimental_option("detach", True)

    # Starta tidtagning
    start_time = time.time()
    start_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"🚀 Scriptet startade {start_timestamp}")

    # Installera och starta ChromeDriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    # Fråga användaren om kategorinamn
    category = "comptia"
    print(f"📚 Vald kategori: {category}\n")

    # Fråga användaren om examnamn (sökning sker case-insensitive)
    selected_exam = "sy0-701"
    print(f"\n📌 Valt exam: {selected_exam}\n")

    # Använd en fast API URL
    api_url = "http://localhost:8888/data"

    # Fråga användaren om sidintervall
    page_input = "1-3"

    # Bas-URL för diskussionssidor
    base_url = f"https://www.examtopics.com/discussions/{category}/"

    # Bestäm vilka sidor som ska skannas
    if page_input.lower() == "auto":
        driver.get(base_url + "1/")
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "discussion-list-page-indicator"))
            )
            total_pages_element = driver.find_element(By.XPATH, "/html/body/div[2]/div/div[1]/div/span/span[1]")
            total_pages_text = total_pages_element.text
            match = re.search(r"of (\d+)", total_pages_text)
            if match:
                total_pages = int(match.group(1))
                print(f"🔍 Hittade {total_pages} sidor.")
            else:
                print("⚠ Kunde inte detektera totala sidor. Standardinställning: 1 sida.")
                total_pages = 1
        except Exception as e:
            print(f"❌ Fel vid siddetektion: {e}")
            total_pages = 1
        page_range = range(1, total_pages + 1)
    else:
        try:
            start_page, end_page = map(int, page_input.split("-"))
            page_range = range(start_page, end_page + 1)
        except ValueError:
            print("⚠ Ogiltigt sidintervall. Standardinställning: sida 1.")
            page_range = range(1, 2)

    # Lista med bokstäver för att mappa svarsalternativen (A, B, C, …)
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    # Loop genom de angivna sidorna
    for page_number in page_range:
        page_url = f"{base_url}{page_number}/"
        driver.get(page_url)
        print(f"🔎 Skannar {page_url} efter diskussioner om {selected_exam}...")

        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "discussion-list"))
        )

        # Hitta diskussioner med examnamnet (case-insensitive)
        discussions = driver.find_elements(
            By.XPATH, f"//a[contains(translate(text(), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), '{selected_exam.upper()}')]"
        )
        
        if not discussions:
            print(f"⚠ Inga diskussioner hittades för {selected_exam} på sida {page_number}.")
            continue

        for discussion in discussions:
            try:
                discussion_url = discussion.get_attribute("href")
                driver.get(discussion_url)
                WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
                time.sleep(0.1)  # Låt sidan ladda

                # Extrahera examkod och frågenummer från rubriken
                header_text = driver.find_element(By.TAG_NAME, "h1").text.strip()
                exam_match = re.search(r"(Exam \w+-\w+)", header_text)
                exam_version = exam_match.group(1) if exam_match else selected_exam
                question_match = re.search(r"question (\d+)", header_text, re.IGNORECASE)
                question_number = question_match.group(1) if question_match else "Unknown"

                # Hämta själva frågetexten
                question_text = driver.find_element(By.CLASS_NAME, "card-text").text.strip()

                # Hämta svarsalternativen och ta bort ledande bokstavsmärkningar (t.ex. "A. ")
                answer_choices = driver.find_elements(By.XPATH, "//div[@class='question-choices-container']//li")
                choices_texts = [re.sub(r'^[A-Za-z]\.\s*', '', choice.text.strip()) for choice in answer_choices]

                # Klicka på "Show Suggested Answer" om möjligt
                try:
                    show_answer_button = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Show Suggested Answer')]"))
                    )
                    show_answer_button.click()
                    time.sleep(0.1)
                except:
                    print("⚠ 'Show Suggested Answer'-knappen hittades inte.")

                # Hämta "Most Voted" svar
                try:
                    most_voted_answer = driver.find_element(By.CLASS_NAME, "question-answer")
                    answer_text = most_voted_answer.text.strip()
                    cleaned_answer_text = re.sub(r'[^\w\s,.-]', '', answer_text).replace('\n', ' ').strip()
                except:
                    cleaned_answer_text = "N/A"

                # Extrahera korrekta svarsbokstäver (kan vara flera, t.ex. "AC" eller "BD")
                match_correct = re.search(r"Suggested Answer\s*([A-Za-z]+)", cleaned_answer_text)
                if match_correct:
                    correct_letters = list(match_correct.group(1).upper())
                else:
                    correct_letters = []

                # Bygg lista med svarsalternativ – lägg bara in "correct": true om alternativet är korrekt
                answers_list = []
                for i, choice_text in enumerate(choices_texts):
                    letter = letters[i]  # Mappa ut A, B, C, ...
                    answer_obj = {"content": choice_text}
                    if letter in correct_letters:
                        answer_obj["correct_answer"] = True
                    answers_list.append(answer_obj)

                # Bygg JSON-objektet för frågan
                question_data = {
                    "exam": exam_version,
                    "question_number": question_number,
                    "source": discussion_url,
                    "content": question_text,
                    "answers": answers_list
                }

                print(f"✅ Fråga {question_number} extraherad.")
                print(json.dumps(question_data, indent=2, ensure_ascii=False))  # För verifiering

                # Skicka den enskilda frågedatan till API:t
                try:
                    response = requests.post(api_url, json=question_data)
                    if response.status_code == 200 or response.status_code == 201:
                        print("✅ Fråga skickad till API.")
                    else:
                        print(f"❌ API-sändning misslyckades med statuskod: {response.status_code}")
                        print("Svar från API:", response.text)
                except Exception as e:
                    print(f"❌ Fel vid API-anrop: {e}")

            except Exception as e:
                print(f"❌ Kunde inte extrahera data från {discussion_url}: {e}")
            
            # Gå tillbaka till diskussionslistan
            driver.back()
            time.sleep(0.1)

    end_time = time.time()
    end_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    elapsed_time = end_time - start_time

    print(f"🕒 Scriptet avslutades {end_timestamp}")
    print(f"⏳ Total körtid: {elapsed_time:.2f} sekunder")

    driver.quit()
