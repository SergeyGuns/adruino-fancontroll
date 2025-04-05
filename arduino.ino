const int fanCount = 1; // Количество вентиляторов
const int fanPins[1] = {6}; // Выводы для управления вентиляторами (PWM) который поддерживает ШИМ
int fanSpeeds[1] = {0}; // Скорости вентиляторов (0-255)
const int ledPin = 13; // Вывод для светодиода

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < fanCount; i++) {
    pinMode(fanPins[i], OUTPUT);
  }
  pinMode(ledPin, OUTPUT);
}

void loop() {

  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    if (command == "ECHO_REQUEST") {
      Serial.println("ECHO_RESPONSE");
    } else if (command.startsWith("SET_FAN")) {
      int fanIndex = command.charAt(8) - '0'; // Получаем индекс вентилятора
      int fanSpeed = command.substring(10).toInt(); // Получаем скорость вентилятора
      if (fanIndex >= 0 && fanIndex < fanCount && fanSpeed >= 0 && fanSpeed <= 255) {
        fanSpeeds[fanIndex] = fanSpeed;
        analogWrite(fanPins[fanIndex], fanSpeeds[fanIndex]);
      }
    } else if (command == "GET_FAN_COUNT") {
      Serial.println(fanCount);
    }
  }
}
