var mainCPPTemplate = 
`#include <Arduino.h>
#include <Keyboard.h>

void sendShortcut(int index);
void releaseShortcut(int index);

const int rowPins[] = { A0, A1, A2, A3 };
const int columnPins[] = { 2, 3, 4, 5, 6, 7, 8, 9 };

int rowNum = sizeof(rowPins) / sizeof(rowPins[0]);
int columnNum = sizeof(columnPins) / sizeof(columnPins[0]);

uint32_t currentState = 0;
uint32_t previousState = 0;
uint32_t rawState = 0;
uint32_t stableState = 0;

const unsigned long debounceMs = 10;
unsigned long lastChangeTime[32] = {0};

const uint8_t shortcuts[32][3] = {
  { R1C1,  R1C2,  R1C3  },
  { R2C1,  R2C2,  R2C3  },
  { R3C1,  R3C2,  R3C3  },
  { R4C1,  R4C2,  R4C3  },
  { R5C1,  R5C2,  R5C3  },
  { R6C1,  R6C2,  R6C3  },
  { R7C1,  R7C2,  R7C3  },
  { R8C1,  R8C2,  R8C3  },
  { R9C1,  R9C2,  R9C3  },
  { R10C1, R10C2, R10C3 },
  { R11C1, R11C2, R11C3 },
  { R12C1, R12C2, R12C3 },
  { R13C1, R13C2, R13C3 },
  { R14C1, R14C2, R14C3 },
  { R15C1, R15C2, R15C3 },
  { R16C1, R16C2, R16C3 },
  { R17C1, R17C2, R17C3 },
  { R18C1, R18C2, R18C3 },
  { R19C1, R19C2, R19C3 },
  { R20C1, R20C2, R20C3 },
  { R21C1, R21C2, R21C3 },
  { R22C1, R22C2, R22C3 },
  { R23C1, R23C2, R23C3 },
  { R24C1, R24C2, R24C3 },
  { R25C1, R25C2, R25C3 },
  { R26C1, R26C2, R26C3 },
  { R27C1, R27C2, R27C3 },
  { R28C1, R28C2, R28C3 },
  { R29C1, R29C2, R29C3 },
  { R30C1, R30C2, R30C3 },
  { R31C1, R31C2, R31C3 },
  { R32C1, R32C2, R32C3 },
};

void setup() {
  delay(3000);
  Keyboard.begin(KeyboardLayout_en_US);

  for (int i = 0; i < rowNum; i++) {
    pinMode(rowPins[i], OUTPUT);
    digitalWrite(rowPins[i], HIGH);
  }

  for (int i = 0; i < columnNum; i++) {
    pinMode(columnPins[i], INPUT_PULLUP);
  }
}

void loop() {
  for (int r = 0; r < rowNum; r++) {
    digitalWrite(rowPins[r], LOW);
    delayMicroseconds(5);

    for (int c = 0; c < columnNum; c++) {
      int keyIndex = r * columnNum + c;
      bool pressed = !digitalRead(columnPins[c]);
      bool wasPressed = bitRead(rawState, keyIndex);
      if (pressed != wasPressed) {
        lastChangeTime[keyIndex] = millis();
        bitWrite(rawState, keyIndex, pressed);
      }
      if (millis() - lastChangeTime[keyIndex] > debounceMs) {
        bitWrite(stableState, keyIndex, pressed);
      }
    }
    digitalWrite(rowPins[r], HIGH);
  }
  uint32_t pressedEvents  = stableState & ~previousState;
  uint32_t releasedEvents = ~stableState & previousState;
  previousState = stableState;

  for (int i = 0; i < rowNum * columnNum; i++) {
    if(bitRead(pressedEvents, i) == 1) {
      sendShortcut(i);
    }
    if(bitRead(releasedEvents, i) == 1) {
      releaseShortcut(i);
    }
  }
}

void sendShortcut(int index) {
  for (int i = 0; i < 3; i++) {
    if (shortcuts[index][i] != 0) {
      Keyboard.press(shortcuts[index][i]);
    }
  }
}

void releaseShortcut(int index) {
  for (int i = 0; i < 3; i++) {
    if (shortcuts[index][i] != 0) {
      Keyboard.release(shortcuts[index][i]);
    }
  }
}`;

var mainCPP = mainCPPTemplate;