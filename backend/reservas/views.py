# backend/reservas/views.py (CÓDIGO COMPLETO Y SIMPLIFICADO)

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Habitacion, Reserva, TipoHabitacion, Servicio
from .serializers import HabitacionDisponibleSerializer, ReservaSerializer, TipoHabitacionSerializer, ServicioSerializer
from django.db.models import Q
from datetime import date
from pagos.models import Transaccion 


# -----------------------------------------------------------------
# FUNCIÓN AUXILIAR (SIMPLIFICADA PARA DEPURACIÓN)
# -----------------------------------------------------------------
def obtener_habitaciones_disponibles(fecha_in, fecha_out):
    """
    Lógica de depuración: Ignora las fechas temporalmente y devuelve
    TODAS las habitaciones que estén marcadas como 'LIBRE'.
    """
    
    # ⚠️ LÓGICA DE FECHAS DESACTIVADA TEMPORALMENTE:
    # reservas_conflictivas = Reserva.objects.filter(
    #     Q(fecha_checkin__lt=fecha_out) & Q(fecha_checkout__gt=fecha_in)
    # ).values_list('habitacion_id', flat=True).distinct()
    
    habitaciones_disponibles = Habitacion.objects.filter(
        # ~Q(id__in=reservas_conflictivas),
        estado='LIBRE' # Solo filtra por 'LIBRE'
    )
    
    # Imprimir en la consola del Backend qué está encontrando
    print(f"Buscando... Se encontraron {habitaciones_disponibles.count()} habitaciones 'LIBRE'.")
    
    return habitaciones_disponibles


# -----------------------------------------------------------------
# VISTAS DE LECTURA PÚBLICA (Se mantienen)
# -----------------------------------------------------------------

class TipoHabitacionReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TipoHabitacion.objects.all()
    serializer_class = TipoHabitacionSerializer
    permission_classes = [permissions.AllowAny]

class ServicioReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer
    permission_classes = [permissions.AllowAny]


# -----------------------------------------------------------------
# VISTA DE RESERVAS (Lógica Transaccional)
# -----------------------------------------------------------------
class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all() 
    serializer_class = ReservaSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'get_disponibilidad']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


    # Endpoint 1: GET /api/reservas/disponibilidad/
    @action(detail=False, methods=['get'], url_path='disponibilidad')
    def get_disponibilidad(self, request):
        fecha_checkin_str = request.query_params.get('check_in')
        fecha_checkout_str = request.query_params.get('check_out')

        if not fecha_checkin_str or not fecha_checkout_str:
            return Response({'error': 'Fechas de check-in/out son requeridas (YYYY-MM-DD).'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            fecha_checkin = date.fromisoformat(fecha_checkin_str)
            fecha_checkout = date.fromisoformat(fecha_checkout_str)
        except ValueError:
             return Response({'error': 'Formato de fecha inválido (YYYY-MM-DD).'}, status=status.HTTP_400_BAD_REQUEST)
        
        # ⚠️ LLAMADA A LA FUNCIÓN SIMPLIFICADA
        habitaciones = obtener_habitaciones_disponibles(fecha_checkin, fecha_checkout) 
        
        serializer = HabitacionDisponibleSerializer(habitaciones, many=True)
        return Response(serializer.data)
        
    
    # Endpoint 2: POST /api/reservas/ (Se mantiene igual)
    def create(self, request, *args, **kwargs):
        # ... (La lógica de creación de reserva se mantiene) ...
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save() 
        reserva = serializer.instance
        
        transaccion = Transaccion.objects.create(
            reserva=reserva,
            monto=reserva.total_pagado,
            buy_order=reserva.codigo_reserva,
            token_transbank=f"TOKEN-{reserva.codigo_reserva}-{reserva.id}", 
            estado='APROBADO', 
            codigo_autorizacion='AUTH12345'
        )
        
        reserva.estado = 'CONFIRMADA'
        reserva.save()
        
        return Response({
            "message": "Reserva creada y pago simulado como APROBADO.",
            "reserva": serializer.data,
            "transaccion_id": transaccion.id
        }, status=status.HTTP_201_CREATED)