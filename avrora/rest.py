import json

from django.http import JsonResponse
from django.views import View

from avrora.models import *

class SetDeviceData(View):
    """ Класс установки данных для девайсов """

    def get(self, request):
        try:
            data = json.loads(request.GET.get('data'))
            device, created = Device.objects.get_or_create(id=int(data['id']))
            if created:
                device.key = data['key']
                device.save()
            if device.approve:
                if device.key == data['key']:
                    devicedata, created = DeviceData.objects.update_or_create(
                        device_id=device.id,
                        defaults={
                            'status': int(data['status']),
                            'ac_power': data['ac_power'],
                            'led_ok': data['led_ok'],
                            'temperature': int(data['temperature']),
                            'angle_x': int(data['angle_x']),
                            'angle_y': int(data['angle_y']),
                            'latitude': float(data['latitude']),
                            'longitude': float(data['longitude']),
                            'battery': int(data['battery']),
                            'uptime': int(data['uptime']),
                        }
                    )
                else:
                    return JsonResponse({'status': 'NO', 'err': 'Device key not valid'}, safe=False)
            else:
                return JsonResponse({'status': 'NO', 'err': 'Device not approved'}, safe=False)
            return JsonResponse({'status': 'OK', 'err': ''}, safe=False)
        except Exception as exc:
            return JsonResponse({'status': 'NO', 'err': str(exc)}, safe=False)
