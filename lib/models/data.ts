import { ClockifyError } from './clockify-error';

export interface SuccessData<T> {
  status: 'success';
  data: T;
}

export interface FailureData {
  status: 'failure';
  data: ClockifyError;
}
