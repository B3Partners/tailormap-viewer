import { IconService } from './icon.service';
import { ICON_SERVICE_ICON_LOCATION } from './icon-service.injection-token';
import { APP_BASE_HREF } from '@angular/common';
import { TestBed } from '@angular/core/testing';

describe('IconService', () => {
  let service: IconService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IconService,
        { provide: ICON_SERVICE_ICON_LOCATION, useValue: 'assets/imgs' },
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    });
    service = TestBed.inject(IconService);
  });

  it('create service', () => {
    expect(service).toBeTruthy();
    expect(service.getUrl()).toEqual('/assets/imgs/');
    expect(service.getUrlForIcon('draw_polygon')).toEqual('/assets/imgs/draw_polygon.svg');
    expect(service.getUrlForIcon('draw_polygon', 'markers')).toEqual('/assets/imgs/markers/draw_polygon.svg');
  });

  it('loads icons to registry', () => {
    const iconRegistryMock: any = {
      addSvgIcon: jest.fn(),
    };
    const domSanitizerMock: any = {
      bypassSecurityTrustResourceUrl: jest.fn((url: string) => url),
    };
    service.loadIconsToIconRegistry(iconRegistryMock, domSanitizerMock);
    const iconCount = service.icons.reduce((count, icon) => {
      return count + (typeof icon === 'string' ? 1 : icon.icons.length);
    }, 0);
    expect(iconRegistryMock.addSvgIcon).toHaveBeenCalledTimes(iconCount);
    expect(iconRegistryMock.addSvgIcon.mock.calls[0][0]).toEqual('draw_polygon');
    expect(iconRegistryMock.addSvgIcon.mock.calls[0][1]).toEqual('/assets/imgs/draw_polygon.svg');
  });

});
