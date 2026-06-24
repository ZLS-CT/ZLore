let mixinInject = null
try {
    let itemStackMixin = new Mixin("net.minecraft.world.item.ItemStack")

    mixinInject = itemStackMixin.inject({
        method: "getTooltipLines",
        at: new At("TAIL"),
        locals: [
            new Local({ type: "Ljava/util/List;", ordinal: 0 }),
        ],
        cancellable: true,
    })
} catch (e) { }

export const itemStack_modifyTooltip = mixinInject
