
import {IsNumber} from 'class-validator';

export class PowerTaskInput {

    @IsNumber()
    power: number;

    bug: boolean;

}

export class PowerTaskOutput {

    @IsNumber()
    result: number;

}
