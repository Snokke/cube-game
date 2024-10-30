import * as PIXI from 'pixi.js';
import mitt, { Emitter } from 'mitt';
import RotateButtons from './RotateButtons';
import DebugConfig from '../scene/Configs/Main/DebugConfig';
import ScreensController from './ScreensController';
import { ScreenType } from '../scene/Enums/UI/ScreenType';
import { ILevelScore } from '../scene/Interfaces/IScore';
import MuteButton from './MuteButton';

type Events = {
  rotateRight: string;
  rotateLeft: string;
  rotateUp: string;
  rotateDown: string;
  rotateClockwise: string;
  rotateCounterClockwise: string;
  onStartClick: string;
  onNextLevelClick: string;
  onStartAgain: string;
};

export default class UI extends PIXI.Container {
  private screensController: ScreensController;
  private rotateButtons: RotateButtons;
  private muteButton: MuteButton;

  public emitter: Emitter<Events> = mitt<Events>();

  constructor() {
    super();

    this.init();
  }

  public onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.muteButton.x = 50;
    this.muteButton.y = 50;

    this.screensController.onResize(width, height);

    if (DebugConfig.gameplay.cubeRotationButtons) {
      this.rotateButtons.onResize();

      this.rotateButtons.x = width * 0.5;
      this.rotateButtons.y = height * 0.5;
    }
  }

  public showScreen(screenType: ScreenType): void {
    this.screensController.showScreen(screenType);
  }

  public hideScreen(screenType: ScreenType): void {
    this.screensController.hideScreen(screenType);
  }

  public getActiveScreen(): ScreenType {
    return this.screensController.getActiveScreen();
  }

  public updateLevelText(level: number): void {
    this.screensController.updateLevelText(level);
  }

  public updateScore(score: number): void {
    this.screensController.updateScore(score);
  }

  public updateLives(lives: number): void {
    this.screensController.updateLives(lives);
  }

  public setLevelTime(time: number): void {
    this.screensController.setLevelTime(time);
  }

  public setScoreForLevel(score: ILevelScore): void {
    this.screensController.setScoreForLevel(score);
  }

  public setOverallScore(score: number): void {
    this.screensController.setOverallScore(score);
  }

  private init(): void {
    this.initMuteButton();
    this.initScreensController();
    this.initDebugRotateButtons();
  }

  private initMuteButton(): void {
    const muteButton = this.muteButton = new MuteButton();
    this.addChild(muteButton);
  }

  private initScreensController(): void {
    const screensController = this.screensController = new ScreensController();
    this.addChild(screensController);
  }

  private initDebugRotateButtons(): void {
    if (DebugConfig.gameplay.cubeRotationButtons) {
      const rotateButtons = this.rotateButtons = new RotateButtons();
      this.addChild(rotateButtons);
  
      rotateButtons.emitter.on('rotateRight', () => this.emitter.emit('rotateRight'));
      rotateButtons.emitter.on('rotateLeft', () => this.emitter.emit('rotateLeft'));
      rotateButtons.emitter.on('rotateUp', () => this.emitter.emit('rotateUp'));
      rotateButtons.emitter.on('rotateDown', () => this.emitter.emit('rotateDown'));
      rotateButtons.emitter.on('rotateClockwise', () => this.emitter.emit('rotateClockwise'));
      rotateButtons.emitter.on('rotateCounterClockwise', () => this.emitter.emit('rotateCounterClockwise'));
    }

    this.screensController.emitter.on('onStartClick', () => this.emitter.emit('onStartClick'));
    this.screensController.emitter.on('onNextLevelClick', () => this.emitter.emit('onNextLevelClick'));
    this.screensController.emitter.on('onStartAgain', () => this.emitter.emit('onStartAgain'));
  }
}
