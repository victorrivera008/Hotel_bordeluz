# backend/reservas/serializers.py (CÓDIGO COMPLETO)

from rest_framework import serializers
from .models import TipoHabitacion, Habitacion, Servicio, Reserva, ItemServicioReserva
from django.db import transaction
from datetime import date

# ---------------------------------------------------------
# SERIALIZADORES DE CONTENIDO (ACTUALIZADOS)
# ---------------------------------------------------------

class TipoHabitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoHabitacion
        fields = ['id', 'nombre', 'precio_base', 'capacidad_maxima']

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        # ⚠️ CORREGIDO: Eliminamos 'descripcion'
        fields = ['id', 'nombre', 'precio']

# ... (El resto del archivo, HabitacionDisponibleSerializer, ReservaSerializer, etc., se mantiene igual) ...
# -----------------------------------------------------------------
# SERIALIZADORES DE RESERVA (Se mantienen igual)
# -----------------------------------------------------------------

class HabitacionDisponibleSerializer(serializers.ModelSerializer):
    tipo_detalle = TipoHabitacionSerializer(source='tipo', read_only=True) 

    class Meta:
        model = Habitacion
        fields = ['id', 'numero', 'estado', 'tipo', 'tipo_detalle']

class ItemServicioReservaSerializer(serializers.ModelSerializer):
    servicio_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ItemServicioReserva
        fields = ['servicio_id', 'cantidad']

class ReservaSerializer(serializers.ModelSerializer):
    servicios = ItemServicioReservaSerializer(many=True, required=False)
    
    class Meta:
        model = Reserva
        fields = ['id', 'habitacion', 'fecha_checkin', 'fecha_checkout', 'servicios']
        read_only_fields = ['id'] 
        
    def validate(self, data):
        if data['fecha_checkin'] >= data['fecha_checkout']:
            raise serializers.ValidationError("La fecha de check-out debe ser posterior al check-in.")
        return data
    
    @transaction.atomic 
    def create(self, validated_data):
        servicios_data = validated_data.pop('servicios', [])
        
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError({"cliente": "Se requiere autenticación para crear una reserva."})
            
        validated_data['cliente'] = request.user 
        
        hoy_str = date.today().strftime('%Y%m%d')
        validated_data['codigo_reserva'] = f"RSV-{hoy_str}-{Reserva.objects.count() + 1}"
        
        reserva = Reserva.objects.create(**validated_data)
        total_servicios = 0
        
        for item_data in servicios_data:
            try:
                servicio = Servicio.objects.get(id=item_data['servicio_id'])
            except Servicio.DoesNotExist:
                 raise serializers.ValidationError(f"Servicio ID {item_data['servicio_id']} no encontrado.")

            cantidad = item_data['cantidad']
            ItemServicioReserva.objects.create(
                reserva=reserva, 
                servicio=servicio, 
                cantidad=cantidad, 
                precio_unitario=servicio.precio
            )
            total_servicios += (cantidad * servicio.precio)

        dias = (reserva.fecha_checkout - reserva.fecha_checkin).days
        precio_noche = reserva.habitacion.tipo.precio_base
        total_habitacion = precio_noche * dias
        
        reserva.total_pagado = total_servicios + total_habitacion
        reserva.save()
        
        return reserva