import pandas as pd
import copy
from pathlib import Path
import warnings
import matplotlib
import matplotlib.pyplot as plt

import numpy as np
import pandas as pd
import pytorch_lightning as pl
from pytorch_lightning.callbacks import EarlyStopping, LearningRateMonitor
from pytorch_lightning.loggers import TensorBoardLogger
import torch

from pytorch_forecasting import Baseline, TemporalFusionTransformer, TimeSeriesDataSet
from pytorch_forecasting.data import NaNLabelEncoder, GroupNormalizer
from pytorch_forecasting.metrics import SMAPE, PoissonLoss, QuantileLoss
from pytorch_forecasting.models.temporal_fusion_transformer.tuning import optimize_hyperparameters
import json
data = pd.read_csv('./data/batch-test.csv')
#print(data.get('low'))
jsm = open('data/meta.json', 'r')
meta = json.load(jsm)
print(meta["groups"])
data["symbol"] = data["symbol"].astype("category")
data["cumFoam"] = data["cumFoam"] + 1e6
training = TimeSeriesDataSet(
    data[lambda x: x.date <= 300],
    time_idx="date",
    group_ids=["symbol"],
    target="open",
    #["open", "high", "low", "volume"],
    allow_missings= True,
    #group_ids=["agency", "sku"],
    min_encoder_length=50,#max_encoder_length // 2,  # allow encoder lengths from 0 to max_prediction_length
    max_encoder_length=100,#max_encoder_length,
    min_prediction_length=20,
    max_prediction_length=20,#max_prediction_length,
    static_categoricals=["symbol"],
    #static_reals=["avg_population_2017", "avg_yearly_household_income_2017"],
    #time_varying_known_categoricals=["special_days", "month"],
    #variable_groups={"special_days": special_days},  # group of categorical variables can be treated as one variable
    time_varying_known_reals=meta["knownReals"],
    #time_varying_unknown_categoricals=[],#meta["features"],
    time_varying_unknown_reals=meta["unknownReals"],
    #target_normalizer=NaNLabelEncoder(add_nan=True),
    target_normalizer=None,
    #GroupNormalizer(
    #    groups=["symbol"], transformation="softplus", center=False
    #),  # use softplus with beta=1.0 and normalize by group
    #add_relative_time_idx=True,
    #add_target_scales=True,
    add_encoder_length=True,
    categorical_encoders={"symbol": NaNLabelEncoder(add_nan=True)}
)
validation = TimeSeriesDataSet.from_dataset(training, data, predict=True, stop_randomization=True)
batch_size = 64
train_dataloader = training.to_dataloader(train=True, batch_size=batch_size, num_workers=2)
val_dataloader = validation.to_dataloader(train=False, batch_size=batch_size, num_workers=2)


# save datasets
#training.save("training.pkl")
#validation.save("validation.pkl")
early_stop_callback = EarlyStopping(monitor="val_loss", min_delta=1e-4, patience=10, verbose=False, mode="min")
lr_logger = LearningRateMonitor()
trainer = pl.Trainer(
    max_epochs=1000,
    #min_epochs=100,
    gpus=0,
    weights_summary="top",
    gradient_clip_val=0.14578,
    limit_train_batches=30,
    # val_check_interval=20,
    # limit_val_batches=1,
    # fast_dev_run=True,
    # logger=logger,
    # profiler=True,
    callbacks=[lr_logger, early_stop_callback],
)

tft = TemporalFusionTransformer.load_from_checkpoint("/home/johnny/tempy/lightning_logs/version_36/checkpoints/epoch=157-step=4739.ckpt")#/home/johnny/tempy/lightning_logs/version_31/checkpoints/epoch=20-step=83.ckpt")#best_model_path)
"""
tft = TemporalFusionTransformer.from_dataset(
    training,
    learning_rate=0.02,
    hidden_size=12,
    attention_head_size=6,
    dropout=0.1,
    hidden_continuous_size=12,
    output_size=8,
    loss=QuantileLoss(),
    log_interval=10,
    #log_val_interval=1,
    reduce_on_plateau_patience=10,
)
"""
print(f"Number of parameters in network: {tft.size()/1e3:.1f}k")
"""
trainer.fit(
    tft,
    train_dataloader=train_dataloader,
    val_dataloaders=val_dataloader,
)
"""
trainer.fit(
    tft,
    train_dataloader=train_dataloader,
    val_dataloaders=val_dataloader,
)
best_model_path = trainer.checkpoint_callback.best_model_path
# need to save it manually
print(best_model_path)
#quit()
actuals = torch.cat([y[0] for x, y in iter(val_dataloader)])
predictions = tft.predict(val_dataloader)
mean = (actuals - predictions).abs().mean()
print(mean) 

raw_predictions, x = tft.predict(val_dataloader, mode="raw", return_x=True)
#print(x)
#print(raw_predictions)
#for idx in range(10):  # plot 10 examples
#    tft.plot_prediction(x, raw_predictions, idx=idx, add_loss_to_title=True);
#print(f"suggested learning rate: {res.suggestion()}")
#fig = res.plot(show=True, suggest=True)
#fig.savefig('lr.png')
fig, ax = plt.subplots()
t = np.arange(0, 20, 1)
ax.plot(t, predictions.flatten().tolist())

ax.set(xlabel='time (s)', ylabel='voltage (mV)',
       title='About as simple as it gets, folks')
ax.grid()

fig.savefig("test.png")
print(x)
#plt.show()
