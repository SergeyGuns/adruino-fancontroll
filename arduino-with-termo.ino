// Определяем пин, к которому подключен термистор
#define THERMISTOR_PIN A3

const int fanCount = 1; // Количество вентиляторов
const int fanPins[1] = {6}; // Выводы для управления вентиляторами (PWM)
int fanSpeeds[1] = {0}; // Скорости вентиляторов (0-255)
const int ledPin = 13; // Вывод для светодиода
int baseFanSpeed = 0; // Базовая скорость вентилятора, установленная командой
int maxTermoTemp = 40; 
void setup() {
  Serial.begin(9600);
  for (int i = 0; i < fanCount; i++) {
    pinMode(fanPins[i], OUTPUT);
  }
  pinMode(ledPin, OUTPUT);
}

void loop() {
  // Массив для хранения 30 значений
  int analogValues[30];
  // Переменная для хранения суммы значений
  long sum = 0;

  // Считываем 30 значений с аналогового пина с интервалом 100 мс
  for (int i = 0; i < 30; i++) {
    analogValues[i] = analogRead(THERMISTOR_PIN);
    sum += analogValues[i];
  }

  // Вычисляем среднее значение
  float averageValue = sum / 30.0;

  // Конвертируем среднее значение в температуру
  float temperature;
  if (averageValue >= 400) {
    temperature = 25 + (37.0 - 25.0) / (400.0 - 477.0) * (averageValue - 477.0);
  } else if (averageValue >= 220) {
    temperature = 37 + (55.0 - 37.0) / (220.0 - 400.0) * (averageValue - 400.0);
  } else {
    temperature = 55 + (90.0 - 55.0) / (85.0 - 220.0) * (averageValue - 220.0);
  }

  // Обновляем скорость вентилятора на основе текущей температуры
  int adjustedFanSpeed = constrain(int(baseFanSpeed * (temperature / maxTermoTemp)), 0, 255);
  for (int i = 0; i < fanCount; i++) {
    analogWrite(fanPins[i], adjustedFanSpeed);
  }

  // Обработка команд из последовательного порта
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    if (command == "ECHO_REQUEST") {
      Serial.println("ECHO_RESPONSE");
    } else if (command.startsWith("GET_INFO")) {
      Serial.print(adjustedFanSpeed);
      Serial.print("::");
      Serial.println(temperature);
    } else if (command.startsWith("SET_FAN")) {
      int fanIndex = command.charAt(8) - '0'; // Получаем индекс вентилятора
      baseFanSpeed = command.substring(10).toInt(); // Получаем базовую скорость вентилятора
      if (fanIndex >= 0 && fanIndex < fanCount && baseFanSpeed >= 0 && baseFanSpeed <= 255) {
        // Обновляем базовую скорость вентилятора
        fanSpeeds[fanIndex] = baseFanSpeed;
      }
    } else if (command == "GET_FAN_COUNT") {
      Serial.println(fanCount);
    }
  }

}