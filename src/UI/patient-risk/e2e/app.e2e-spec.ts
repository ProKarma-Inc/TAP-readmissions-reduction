import { PatientRiskPage } from './app.po';

describe('patient-risk App', function() {
  let page: PatientRiskPage;

  beforeEach(() => {
    page = new PatientRiskPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
